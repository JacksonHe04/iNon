-- 为 profiles 增加 username 字段（支持每个用户 1 个用户名，全局唯一）
alter table public.profiles
  add column if not exists username text;

create unique index if not exists idx_profiles_username_unique
  on public.profiles (lower(username))
  where username is not null;

-- 回填：默认将 existing profiles 的 slug 填入 username
update public.profiles
set username = slug
where username is null and slug is not null;

-- 创建 profile_slugs 表（支持每个用户多个路径 slug，全局唯一，可包含空字符串代表 / 和 /i）
create table if not exists public.profile_slugs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Slug 全局唯一 (lower)
create unique index if not exists idx_profile_slugs_slug_unique
  on public.profile_slugs (lower(slug));

create index if not exists idx_profile_slugs_profile_id
  on public.profile_slugs (profile_id);

-- 回填 profile_slugs
insert into public.profile_slugs (profile_id, slug)
select id, slug from public.profiles
where slug is not null and slug != ''
on conflict do nothing;

-- 允许 JacksonHe04 (主 profile) 占用空 slug '' (代表 / 和 /i/)
insert into public.profile_slugs (profile_id, slug)
select id, '' from public.profiles
where slug = 'JacksonHe04'
on conflict do nothing;

-- RLS
alter table public.profile_slugs enable row level security;

drop policy if exists "public read profile_slugs" on public.profile_slugs;
create policy "public read profile_slugs"
on public.profile_slugs for select using (true);

drop policy if exists "admin manage profile_slugs" on public.profile_slugs;
create policy "admin manage profile_slugs"
on public.profile_slugs for all to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "owner manage profile_slugs" on public.profile_slugs;
create policy "owner manage profile_slugs"
on public.profile_slugs for all to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = profile_slugs.profile_id and p.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = profile_slugs.profile_id and p.user_id = auth.uid()
  )
);

grant select, insert, update, delete on public.profile_slugs to authenticated;
grant select on public.profile_slugs to anon;
