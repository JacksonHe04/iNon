'use server';

import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  extractClientIp,
  extractReferrerDomain,
  getIpSalt,
  hashIp,
  parseUserAgent,
} from './hash';

export type RecordPageViewInput = {
  profileId: string;
  urlPath?: string;
  referrer?: string;
  sessionId?: string;
  dwellMs?: number;
  eventName?: string;
};

export type RecordPageViewResult =
  | { ok: true; eventId: number }
  | { ok: false; error: string };

/**
 * 服务端统计写入入口。
 * - 必须从 Server Action / Route Handler 调用（不可从客户端组件直接 invoke）。
 * - 使用 createAdminClient（service_role）写入，绕过 page_view_events 的 deny-all RLS。
 * - 写失败不抛出：观测不应阻塞主流程。
 */
export async function recordPageView(
  input: RecordPageViewInput
): Promise<RecordPageViewResult> {
  try {
    if (!input?.profileId) {
      return { ok: false, error: 'profileId is required' };
    }

    const h = await headers();
    const ip = extractClientIp(h);
    const salt = getIpSalt();
    const ipHash = hashIp(ip, salt);

    const ua = h.get('user-agent') ?? '';
    const { device_type, browser, os } = parseUserAgent(ua);

    // 优先使用 Vercel 自动注入的国家头；回退到 Cloudflare / 自定义头
    const country =
      h.get('x-vercel-ip-country') ??
      h.get('cf-ipcountry') ??
      h.get('x-country') ??
      '';

    const refHeader = h.get('referer') ?? input.referrer ?? '';
    const referrerDomain = extractReferrerDomain(refHeader || input.referrer);

    const admin = createAdminClient();
    const { data, error } = await admin.rpc('page_view_record', {
      p_profile_id: input.profileId,
      p_event_name: input.eventName ?? 'page_view',
      p_url_path: (input.urlPath ?? '/').slice(0, 256),
      p_referrer: referrerDomain,
      p_country: country.slice(0, 8),
      p_device_type: device_type,
      p_browser: browser,
      p_os: os,
      p_ip_hash: ipHash,
      p_session_id: (input.sessionId ?? '').slice(0, 64),
      p_user_agent: ua.slice(0, 512),
      p_dwell_ms: Math.max(input.dwellMs ?? 0, 0),
    });

    if (error) {
      // 服务端日志，不抛给客户端
      console.error('[analytics] page_view_record failed:', error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true, eventId: Number(data) };
  } catch (err) {
    console.error('[analytics] recordPageView exception:', err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'unknown error',
    };
  }
}

export async function fetchAnalyticsData(profileId: string) {
  const { getUserContext } = await import('@/lib/auth/user');
  const { getPageViewSummary, getPageViewTotals, getPageViewTop } = await import('./queries');

  const context = await getUserContext();
  if (!context || context.profile.id !== profileId) {
    throw new Error('Unauthorized');
  }

  const [summary, totals, sources, paths, devices, browsers, countries] =
    await Promise.all([
      getPageViewSummary(profileId, 30),
      getPageViewTotals(profileId, 30),
      getPageViewTop(profileId, 'sources', 30, 10),
      getPageViewTop(profileId, 'paths', 30, 10),
      getPageViewTop(profileId, 'devices', 30, 10),
      getPageViewTop(profileId, 'browsers', 30, 10),
      getPageViewTop(profileId, 'countries', 30, 10),
    ]);

  return {
    summary,
    totals,
    sources,
    paths,
    devices,
    browsers,
    countries,
  };
}