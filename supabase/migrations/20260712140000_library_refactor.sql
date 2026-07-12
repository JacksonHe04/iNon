-- =============================================================================
-- Library 重构: 把 media_items(reading/films/music/hiphop)迁移到统一的新表
--                library_categories + library_items, 然后废弃 media_items。
-- =============================================================================
--
-- 范围: 音乐(music) / 影视(film) / 游戏(game) / 读书(book) 四类。
-- 不丢失数据: 所有 media_items 行通过类型映射写入新表, 迁移完成后做行数校验,
--             校验通过才 DROP media_items。
--
-- 映射:
--   (music,  album)    -> (music, work,    cat="音乐")
--   (music,  song)     -> (music, song,    cat="音乐")
--   (music,  musician) -> (music, creator, cat="音乐")
--   (hiphop, album)    -> (music, work,    cat="嘻哈")
--   (hiphop, song)     -> (music, song,    cat="嘻哈")
--   (hiphop, musician) -> (music, creator, cat="嘻哈")
--   (films,  film)     -> (film,  work,    cat="电影")
--   (films,  director) -> (film,  creator, cat="电影")
--   (reading, book)    -> (book,  work,    cat="读书")
--   (reading, author)  -> (book,  creator, cat="读书")
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. 新表: library_categories
-- -----------------------------------------------------------------------------
create table if not exists public.library_categories (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in ('music', 'film', 'game', 'book')),
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default timezone('utc'::text, now()),
  unique (profile_id, kind, name)
);

create index if not exists idx_library_categories_profile_kind
  on public.library_categories (profile_id, kind, sort_order);

-- -----------------------------------------------------------------------------
-- 2. 新表: library_items
-- -----------------------------------------------------------------------------
create table if not exists public.library_items (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  kind         text not null check (kind in ('music', 'film', 'game', 'book')),
  subtype      text not null check (subtype in ('work', 'creator', 'song')),
  category_id  uuid references public.library_categories(id) on delete set null,
  name         text not null,
  creator      text not null default '',
  link         text not null default '',
  comment      text not null default '',
  image_url    text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default timezone('utc'::text, now()),
  unique (profile_id, kind, subtype, category_id, name, creator)
);

create index if not exists idx_library_items_profile_kind_subtype
  on public.library_items (profile_id, kind, category_id, subtype, sort_order);

create index if not exists idx_library_items_profile_search
  on public.library_items (profile_id, kind, name);

-- -----------------------------------------------------------------------------
-- 3. RLS
-- -----------------------------------------------------------------------------
alter table public.library_categories enable row level security;
alter table public.library_items     enable row level security;

-- 公开读(任意人可读任意 profile 的 Library, 跟现有公开页语义一致)
drop policy if exists library_categories_read_all on public.library_categories;
create policy library_categories_read_all
  on public.library_categories for select
  using (true);

drop policy if exists library_items_read_all on public.library_items;
create policy library_items_read_all
  on public.library_items for select
  using (true);

-- owner 写: 通过 profiles.user_id 关联当前用户
drop policy if exists library_categories_write_owner on public.library_categories;
create policy library_categories_write_owner
  on public.library_categories for all
  using (
    exists (select 1 from public.profiles p
            where p.id = library_categories.profile_id
              and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p
            where p.id = library_categories.profile_id
              and p.user_id = auth.uid())
  );

drop policy if exists library_items_write_owner on public.library_items;
create policy library_items_write_owner
  on public.library_items for all
  using (
    exists (select 1 from public.profiles p
            where p.id = library_items.profile_id
              and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.profiles p
            where p.id = library_items.profile_id
              and p.user_id = auth.uid())
  );

-- admin 写: admin_users.user_id = auth.uid() 的, 可以写任意 profile
drop policy if exists library_categories_admin_all on public.library_categories;
create policy library_categories_admin_all
  on public.library_categories for all
  using (
    exists (select 1 from public.admin_users a
            where a.user_id = auth.uid() and a.is_active = true)
  )
  with check (
    exists (select 1 from public.admin_users a
            where a.user_id = auth.uid() and a.is_active = true)
  );

drop policy if exists library_items_admin_all on public.library_items;
create policy library_items_admin_all
  on public.library_items for all
  using (
    exists (select 1 from public.admin_users a
            where a.user_id = auth.uid() and a.is_active = true)
  )
  with check (
    exists (select 1 from public.admin_users a
            where a.user_id = auth.uid() and a.is_active = true)
  );

-- -----------------------------------------------------------------------------
-- 4. 数据迁移
-- -----------------------------------------------------------------------------

-- 4a. 为每个 profile 预创建 4 个默认类别
insert into public.library_categories (profile_id, kind, name, sort_order)
select p.id, k.kind, k.name, k.ord
from public.profiles p
cross join (values
  ('music', '音乐', 0),
  ('music', '嘻哈', 1),
  ('film',  '电影', 0),
  ('game',  '游戏', 0),
  ('book',  '读书', 0)
) as k(kind, name, ord)
on conflict (profile_id, kind, name) do nothing;

-- 4b. 从 media_items 读出, 按映射插入 library_items
with source as (
  select
    mi.profile_id,
    -- kind 映射
    case mi.domain
      when 'music'  then 'music'
      when 'hiphop' then 'music'
      when 'films'  then 'film'
      when 'reading' then 'book'
    end as kind,
    -- subtype 映射
    case
      when mi.domain in ('music','hiphop') and mi.item_type = 'album' then 'work'
      when mi.domain in ('music','hiphop') and mi.item_type = 'song' then 'song'
      when mi.domain in ('music','hiphop') and mi.item_type = 'musician' then 'creator'
      when mi.domain = 'films'  and mi.item_type = 'film' then 'work'
      when mi.domain = 'films'  and mi.item_type = 'director' then 'creator'
      when mi.domain = 'reading' and mi.item_type = 'book' then 'work'
      when mi.domain = 'reading' and mi.item_type = 'author' then 'creator'
    end as subtype,
    -- 类别名(用于关联 library_categories)
    case
      when mi.domain = 'music' then '音乐'
      when mi.domain = 'hiphop' then '嘻哈'
      when mi.domain = 'films' then '电影'
      when mi.domain = 'reading' then '读书'
    end as category_name,
    mi.name,
    mi.creator,
    mi.link,
    mi.comment,
    mi.image_url,
    mi.sort_order
  from public.media_items mi
),
-- 用 ROW_NUMBER 保证去重(虽然历史上已去重过, 这里仍保险)
ranked as (
  select s.*,
    row_number() over (
      partition by s.profile_id, s.kind, s.subtype, s.category_name, s.name, s.creator
      order by s.sort_order asc
    ) as rn
  from source s
)
insert into public.library_items
  (profile_id, kind, subtype, category_id, name, creator, link, comment, image_url, sort_order)
select
  r.profile_id,
  r.kind,
  r.subtype,
  c.id,
  r.name,
  r.creator,
  r.link,
  r.comment,
  r.image_url,
  r.sort_order
from ranked r
join public.library_categories c
  on c.profile_id = r.profile_id
 and c.kind = r.kind
 and c.name = r.category_name
where r.rn = 1
on conflict (profile_id, kind, subtype, category_id, name, creator) do nothing;

-- -----------------------------------------------------------------------------
-- 5. 校验: 期望 library_items 行数 = media_items 唯一组数
-- -----------------------------------------------------------------------------
do $$
declare
  src_count     int;
  src_distinct  int;
  dst_count     int;
  cat_count     int;
begin
  select count(*) into src_count from public.media_items;

  select count(*) into src_distinct
  from (
    select distinct profile_id,
           case domain
             when 'music' then 'music'
             when 'hiphop' then 'music'
             when 'films' then 'film'
             when 'reading' then 'book'
           end,
           case
             when domain in ('music','hiphop') and item_type = 'album' then 'work'
             when domain in ('music','hiphop') and item_type = 'song' then 'song'
             when domain in ('music','hiphop') and item_type = 'musician' then 'creator'
             when domain = 'films' and item_type = 'film' then 'work'
             when domain = 'films' and item_type = 'director' then 'creator'
             when domain = 'reading' and item_type = 'book' then 'work'
             when domain = 'reading' and item_type = 'author' then 'creator'
           end,
           name, creator
    from public.media_items
  ) d;

  select count(*) into dst_count from public.library_items;
  select count(*) into cat_count from public.library_categories;

  if dst_count <> src_distinct then
    raise exception 'Migration count mismatch: media_items distinct=%, library_items=%',
      src_distinct, dst_count;
  end if;

  if cat_count = 0 then
    raise exception 'No library_categories created — profiles table appears empty';
  end if;

  raise notice 'Migration OK: media_items=% rows / % distinct groups; library_items=% rows; library_categories=% rows',
    src_count, src_distinct, dst_count, cat_count;
end $$;

-- -----------------------------------------------------------------------------
-- 6. 删旧表
-- -----------------------------------------------------------------------------
drop table if exists public.media_items cascade;

COMMIT;