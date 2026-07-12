import { createAdminClient } from '@/lib/supabase/admin';

export type AnalyticsSummaryRow = {
  stat_date: string;
  pv: number;
  uv: number;
  bounce_rate: number;
};

export type AnalyticsTopRow = {
  key: string;
  count: number;
};

export type AnalyticsTotals = {
  total_pv: number;
  total_uv: number;
  total_ms: number;
  avg_bounce: number;
};

export type TopMetric = 'sources' | 'paths' | 'devices' | 'browsers' | 'countries';

/**
 * 控制台读取层：调 RPC，返回规整后的数据。
 * 仅由服务端组件（控制台页面）调用。
 * 使用 admin client 调 SECURITY DEFINER RPC，避免依赖 RLS（双重保险）。
 */

export async function getPageViewSummary(
  profileId: string,
  days: number = 30
): Promise<AnalyticsSummaryRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('page_view_summary', {
    p_profile_id: profileId,
    p_days: days,
  });

  if (error) {
    console.error('[analytics] page_view_summary failed:', error.message);
    return [];
  }
  return (data ?? []) as AnalyticsSummaryRow[];
}

export async function getPageViewTop(
  profileId: string,
  metric: TopMetric = 'sources',
  days: number = 30,
  limit: number = 10
): Promise<AnalyticsTopRow[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('page_view_top', {
    p_profile_id: profileId,
    p_metric: metric,
    p_days: days,
    p_limit: limit,
  });

  if (error) {
    console.error('[analytics] page_view_top failed:', error.message);
    return [];
  }
  return (data ?? []) as AnalyticsTopRow[];
}

export async function getPageViewTotals(
  profileId: string,
  days: number = 30
): Promise<AnalyticsTotals> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('page_view_totals', {
    p_profile_id: profileId,
    p_days: days,
  });

  if (error) {
    console.error('[analytics] page_view_totals failed:', error.message);
    return { total_pv: 0, total_uv: 0, total_ms: 0, avg_bounce: 0 };
  }

  const row = (data ?? [])[0];
  return {
    total_pv: Number(row?.total_pv ?? 0),
    total_uv: Number(row?.total_uv ?? 0),
    total_ms: Number(row?.total_ms ?? 0),
    avg_bounce: Number(row?.avg_bounce ?? 0),
  };
}