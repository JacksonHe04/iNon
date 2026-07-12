-- ============================================================
-- iNon 访问统计：事件流表 + 日聚合表
-- ============================================================
create extension if not exists pgcrypto;

-- ----------------------------------------------------------
-- 表 1：事件流（page_view_events）
-- ----------------------------------------------------------
create table if not exists public.page_view_events (
  id          bigserial  primary key,
  profile_id  uuid       not null references public.profiles(id) on delete cascade,
  stat_date   date       not null default (timezone('utc'::text, now()))::date,
  event_name  text       not null default 'page_view',
  url_path    text       not null default '/',
  referrer    text       not null default '',
  country     text       not null default '',
  device_type text       not null default ''
                                check (device_type in ('desktop','mobile','tablet','bot','')),
  browser     text       not null default '',
  os          text       not null default '',
  ip_hash     text       not null default '',
  session_id  text       not null default '',
  user_agent  text       not null default '',
  created_at  timestamptz not null default timezone('utc'::text, now())
);

comment on table public.page_view_events is
  'Stream of page view / custom events keyed by profile_id. Append-only; ~90-day hot retention then pruned.';
comment on column public.page_view_events.stat_date is
  'UTC date the event happened; redundant with created_at to support btree index.';
comment on column public.page_view_events.ip_hash is
  'SHA-256 hash of client IP + server-side salt. Never stores raw IP.';

create index if not exists page_view_events_profile_date_idx
  on public.page_view_events (profile_id, stat_date desc, created_at desc);
create index if not exists page_view_events_created_idx
  on public.page_view_events (created_at desc);

alter table public.page_view_events enable row level security;
-- no policies => default deny all; all access via SECURITY DEFINER functions.

-- ----------------------------------------------------------
-- 表 2：日聚合（page_view_daily_stats）
-- ----------------------------------------------------------
create table if not exists public.page_view_daily_stats (
  id            bigserial   primary key,
  profile_id    uuid        not null references public.profiles(id) on delete cascade,
  stat_date     date        not null,
  pv            integer     not null default 0 check (pv >= 0),
  uv            integer     not null default 0 check (uv >= 0),
  bounce_count  integer     not null default 0 check (bounce_count >= 0),
  total_ms      bigint      not null default 0 check (total_ms >= 0),
  sources_top   jsonb       not null default '{}'::jsonb,
  paths_top     jsonb       not null default '{}'::jsonb,
  devices_top   jsonb       not null default '{}'::jsonb,
  browsers_top  jsonb       not null default '{}'::jsonb,
  countries_top jsonb       not null default '{}'::jsonb,
  updated_at    timestamptz not null default timezone('utc'::text, now()),
  created_at    timestamptz not null default timezone('utc'::text, now()),
  unique (profile_id, stat_date)
);

comment on table public.page_view_daily_stats is
  'Per-profile per-day aggregate of page views, unique visitors, top sources/paths/devices/browsers/countries.';

create index if not exists page_view_daily_stats_profile_date_idx
  on public.page_view_daily_stats (profile_id, stat_date desc);
create index if not exists page_view_daily_stats_date_idx
  on public.page_view_daily_stats (stat_date desc);

alter table public.page_view_daily_stats enable row level security;

drop policy if exists page_view_daily_stats_owner_select on public.page_view_daily_stats;
create policy page_view_daily_stats_owner_select
  on public.page_view_daily_stats
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = page_view_daily_stats.profile_id
        and p.user_id = auth.uid()
    )
  );

drop policy if exists page_view_daily_stats_admin_select on public.page_view_daily_stats;
create policy page_view_daily_stats_admin_select
  on public.page_view_daily_stats
  for select
  using (
    exists (
      select 1 from public.admin_users au
      where au.user_id = auth.uid() and au.is_active = true
    )
  );

drop trigger if exists trg_page_view_daily_stats_set_updated_at
  on public.page_view_daily_stats;
create trigger trg_page_view_daily_stats_set_updated_at
  before update on public.page_view_daily_stats
  for each row execute function public.set_updated_at();