'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import { recordPageView } from '@/lib/analytics/actions';

const SESSION_STORAGE_KEY = 'inon_pv_session_id';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return '';
  }
}

/**
 * 公开页统计入口。
 * - profileId 通过 server-side 注入，避免前端再请求后端查 profile。
 * - pathname 变化时记录一次 page_view（路由切换覆盖 SPA 体验）。
 * - Vercel Analytics 的 track() 与 Supabase 的 recordPageView 并行调用，互不依赖。
 * - 失败静默：不阻塞渲染。
 */
export default function PageViewTracker({ profileId }: { profileId: string }) {
  const pathname = usePathname();
  const sessionIdRef = useRef<string>('');
  const enteredAtRef = useRef<number>(0);

  useEffect(() => {
    if (!profileId || !pathname) return;

    // 计算本次访问 dwell（与上一次 page_view 之间的时间）
    const dwell = enteredAtRef.current
      ? Date.now() - enteredAtRef.current
      : 0;
    enteredAtRef.current = Date.now();

    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId();
    }

    // Vercel Analytics：站点总览用
    try {
      track('page_view', { profile_id: profileId, path: pathname });
    } catch {
      // track() 在开发环境若没启用 Vercel 部署会抛错，忽略
    }

    // Supabase：业务侧按 profile 隔离统计
    recordPageView({
      profileId,
      urlPath: pathname,
      sessionId: sessionIdRef.current,
      dwellMs: dwell,
    }).catch(() => {
      // 失败已在 server action 内部打日志
    });
  }, [profileId, pathname]);

  return null;
}