-- ============================================================
-- 修复 page_view_record 初始化 jsonb 计数 bug
-- ============================================================
-- 原始 INSERT 语句把 jsonb_build_object(p_browser, 64) 误写为常量 64
-- （本意是 left(p_browser, 64) 截断 key）。结果是首次插入浏览器计数
-- 就从 64 起算，后续 _merge_top_n 累加后变成 66/67/68 之类怪异数字。
--
-- 影响范围：page_view_daily_stats 中所有 *_top 字段的首次写入。
-- 已写入数据可能需要重置。
-- ============================================================

create or replace function public.page_view_record(
  p_profile_id     uuid,
  p_event_name     text     default 'page_view',
  p_url_path       text     default '/',
  p_referrer       text     default '',
  p_country        text     default '',
  p_device_type    text     default '',
  p_browser        text     default '',
  p_os             text     default '',
  p_ip_hash        text     default '',
  p_session_id     text     default '',
  p_user_agent     text     default '',
  p_dwell_ms       integer  default 0
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id       bigint;
  v_today          date := (timezone('utc'::text, now()))::date;
  v_is_new_uv      boolean;
  v_is_new_session boolean;
  v_ref_domain     text;
  v_path_key       text;
  v_browser_key    text;
begin
  -- 1) 写事件流
  insert into public.page_view_events (
    profile_id, stat_date, event_name, url_path, referrer,
    country, device_type, browser, os, ip_hash, session_id, user_agent
  ) values (
    p_profile_id, v_today, p_event_name, p_url_path, p_referrer,
    p_country, p_device_type, p_browser, p_os, p_ip_hash, p_session_id, p_user_agent
  )
  returning id into v_event_id;

  -- 2) 仅 page_view 进入聚合
  if p_event_name <> 'page_view' then
    return v_event_id;
  end if;

  -- 3) UV 去重
  select not exists (
    select 1 from public.page_view_events e
    where e.profile_id = p_profile_id
      and e.stat_date  = v_today
      and e.event_name = 'page_view'
      and e.ip_hash    = p_ip_hash
      and e.id        <> v_event_id
  ) into v_is_new_uv;

  -- 4) Session 去重
  select not exists (
    select 1 from public.page_view_events e
    where e.profile_id = p_profile_id
      and e.stat_date  = v_today
      and e.event_name = 'page_view'
      and e.session_id = p_session_id
      and e.id        <> v_event_id
      and e.session_id <> ''
  ) into v_is_new_session;

  -- 5) 提取 referrer 域名
  v_ref_domain  := lower(regexp_replace(coalesce(p_referrer, ''), '^https?://([^/]+).*$', '\1'));
  v_ref_domain  := case when v_ref_domain = '' then '' else left(v_ref_domain, 128) end;
  v_path_key    := left(p_url_path, 256);
  v_browser_key := left(p_browser, 64);

  -- 6) UPSERT 聚合
  insert into public.page_view_daily_stats (
    profile_id, stat_date, pv, uv, bounce_count, total_ms,
    sources_top, paths_top, devices_top, browsers_top, countries_top
  ) values (
    p_profile_id, v_today,
    1,
    case when v_is_new_uv then 1 else 0 end,
    case when v_is_new_session then 1 else 0 end,
    greatest(p_dwell_ms, 0),
    jsonb_build_object(v_ref_domain, 1),
    jsonb_build_object(v_path_key, 1),
    jsonb_build_object(p_device_type, 1),
    jsonb_build_object(v_browser_key, 1),
    jsonb_build_object(p_country, 1)
  )
  on conflict (profile_id, stat_date) do update set
    pv           = page_view_daily_stats.pv + 1,
    uv           = page_view_daily_stats.uv + case when v_is_new_uv then 1 else 0 end,
    bounce_count = page_view_daily_stats.bounce_count
                   + case when v_is_new_session then 1 else 0 end,
    total_ms     = page_view_daily_stats.total_ms + greatest(p_dwell_ms, 0),
    sources_top  = public._merge_top_n(page_view_daily_stats.sources_top,  v_ref_domain),
    paths_top    = public._merge_top_n(page_view_daily_stats.paths_top,    v_path_key),
    devices_top  = public._merge_top_n(page_view_daily_stats.devices_top,  p_device_type),
    browsers_top = public._merge_top_n(page_view_daily_stats.browsers_top, v_browser_key),
    countries_top= public._merge_top_n(page_view_daily_stats.countries_top, p_country);

  return v_event_id;
end;
$$;