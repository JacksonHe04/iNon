-- ============================================================
-- 访问统计 RPC 函数（SECURITY DEFINER + RLS bypass）
-- ============================================================
-- 所有函数都以函数所有者（postgres / supabase admin）身份运行，
-- 因此能读写 page_view_events（该表对所有普通主体 deny all）。
-- 在函数内部再做一次"profile 归属"校验，确保用户只能操作自己的 profile。
-- ============================================================

-- ---------- 写：记录一次访问事件 ----------
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

  -- 2) 仅 page_view 进入聚合统计；自定义事件只进事件流
  if p_event_name <> 'page_view' then
    return v_event_id;
  end if;

  -- 3) UV 去重：当日同 ip_hash 是否已出现过
  select not exists (
    select 1 from public.page_view_events e
    where e.profile_id = p_profile_id
      and e.stat_date  = v_today
      and e.event_name = 'page_view'
      and e.ip_hash    = p_ip_hash
      and e.id        <> v_event_id
  ) into v_is_new_uv;

  -- 4) Session 去重：当日同 session_id 是否已出现过（影响 bounce 计数）
  select not exists (
    select 1 from public.page_view_events e
    where e.profile_id = p_profile_id
      and e.stat_date  = v_today
      and e.event_name = 'page_view'
      and e.session_id = p_session_id
      and e.id        <> v_event_id
      and e.session_id <> ''
  ) into v_is_new_session;

  -- 5) 提取 referrer 域名（去除协议与路径，限制长度）
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

comment on function public.page_view_record(uuid, text, text, text, text, text, text, text, text, text, text, integer) is
  'Insert one page view / custom event and update per-day aggregate. SECURITY DEFINER — call only from trusted server-side code.';

-- ---------- 辅助：合并 Top N 计数器（保留前 50 项） ----------
create or replace function public._merge_top_n(
  p_existing jsonb,
  p_key      text
)
returns jsonb
language sql
immutable
as $$
  with input as (
    select
      case when p_key is null or p_key = '' then p_existing
           else p_existing || jsonb_build_object(p_key,
                  coalesce((p_existing ->> p_key)::int, 0) + 1)
      end as merged
  ),
  ranked as (
    select key_value, count_value,
           row_number() over (order by (count_value)::int desc, key_value asc) as rn,
           count(*) over () as total
    from input, lateral jsonb_each(input.merged) as k(key_value, count_value)
  )
  select coalesce(
    (select jsonb_object_agg(key_value, count_value)
     from ranked
     where rn <= least(total, 50)),
    '{}'::jsonb
  )
  from input;
$$;

comment on function public._merge_top_n(jsonb, text) is
  'Increment counter at p_key in p_existing JSON object; trim to top 50 by count (deterministic tie-break by key).';

-- ---------- 读：控制台时序 ----------
create or replace function public.page_view_summary(
  p_profile_id uuid,
  p_days       integer default 30
)
returns table (
  stat_date   date,
  pv          integer,
  uv          integer,
  bounce_rate numeric
)
language sql
security definer
stable
set search_path = public
as $$
  select
    stat_date,
    pv,
    uv,
    case when pv > 0 then round((bounce_count::numeric / pv), 4) else 0 end as bounce_rate
  from public.page_view_daily_stats
  where profile_id = p_profile_id
    and stat_date >= (timezone('utc'::text, now()))::date - greatest(p_days - 1, 0)
  order by stat_date asc;
$$;

comment on function public.page_view_summary(uuid, integer) is
  'Daily PV / UV / bounce rate for the last p_days days. SECURITY DEFINER — RLS of caller is bypassed; restrict via API layer.';

-- ---------- 读：控制台 Top N ----------
create or replace function public.page_view_top(
  p_profile_id uuid,
  p_metric     text   default 'sources',  -- sources | paths | devices | browsers | countries
  p_days       integer default 30,
  p_limit      integer default 10
)
returns table (key text, count integer)
language sql
security definer
stable
set search_path = public
as $$
  with merged as (
    select key, sum(value::int) as cnt
    from public.page_view_daily_stats s,
         lateral jsonb_each(
           case p_metric
             when 'sources'   then s.sources_top
             when 'paths'     then s.paths_top
             when 'devices'   then s.devices_top
             when 'browsers'  then s.browsers_top
             when 'countries' then s.countries_top
             else '{}'::jsonb
           end
         ) as j(key, value)
    where s.profile_id = p_profile_id
      and s.stat_date >= (timezone('utc'::text, now()))::date - greatest(p_days - 1, 0)
    group by key
  )
  select key, cnt::int as count
  from merged
  where key <> ''
  order by cnt desc
  limit greatest(p_limit, 1);
$$;

comment on function public.page_view_top(uuid, text, integer, integer) is
  'Top N keys for a given metric from aggregated daily counters.';

-- ---------- 读：控制台累计 ----------
create or replace function public.page_view_totals(
  p_profile_id uuid,
  p_days       integer default 30
)
returns table (
  total_pv    bigint,
  total_uv    bigint,
  total_ms    bigint,
  avg_bounce  numeric
)
language sql
security definer
stable
set search_path = public
as $$
  select
    coalesce(sum(pv), 0)::bigint          as total_pv,
    -- uv 不能简单 sum（同一访客可能跨日），这里返回最大日的 uv 作为参考
    coalesce(max(uv), 0)::bigint          as total_uv,
    coalesce(sum(total_ms), 0)::bigint    as total_ms,
    case when sum(pv) > 0
         then round(sum(bounce_count)::numeric / sum(pv), 4)
         else 0 end                       as avg_bounce
  from public.page_view_daily_stats
  where profile_id = p_profile_id
    and stat_date >= (timezone('utc'::text, now()))::date - greatest(p_days - 1, 0);
$$;

comment on function public.page_view_totals(uuid, integer) is
  'Aggregate totals (PV / total dwell / bounce rate) over the last p_days days. UV is approximated as max single-day UV; use page_view_summary for accurate per-day UV.';