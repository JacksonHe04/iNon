-- =============================================================================
-- media_assets：从「profile 强绑的图床替身表」改为「全站共享图床」
-- =============================================================================
-- 背景：旧实现里 media_assets.profile_id 不为空且外键到 profiles.id，
--       上传/列表代码都硬绑到 DEFAULT_PROFILE_SLUG 那一行，
--       本质是一个"用 user 顶替"的丑陋等价物。
-- 新语义：profile_id = 上传者（审计用），可空。
--         表的读写权限：
--           - SELECT：仅管理员（防止 REST 端点枚举全图床 inventory）
--           - WRITE：仅管理员（仅 admin manage media_assets 一条就够了）
--         对象层（storage.objects / CDN public URL）保持 public，
--           任何浏览器直链访问图片内容不受影响。
-- =============================================================================

-- 1. 列改为可空 + 注释改语义
alter table public.media_assets
  alter column profile_id drop not null,
  alter column profile_id set default null;

comment on column public.media_assets.profile_id is
  'Audit field: uploader profile id. Nullable. Not used for ownership or RLS.';

-- 2. 外键改为 on delete set null（profile 删除后保留资产行，只失去审计字段）
alter table public.media_assets
  drop constraint if exists media_assets_profile_id_fkey;

alter table public.media_assets
  add constraint media_assets_profile_id_fkey
  foreign key (profile_id) references public.profiles(id) on delete set null;

-- 3. 旧的「公开发布档案可见」策略失效（依赖 is_published_profile(profile_id)，
--    profile_id=null 时无法判定），drop 它
drop policy if exists "public can read media assets" on public.media_assets;

-- 4. 新增「仅管理员可 select」
drop policy if exists "admin can view all media assets" on public.media_assets;
create policy "admin can view all media assets"
  on public.media_assets
  for select
  to authenticated
  using (public.is_admin_user());

-- 5. 重写索引：原 idx_media_assets_profile_sort 在 (profile_id, asset_type, sort_order)
--    profile_id 现在可空，但仍是常用 audit 维度。保留该索引即可，
--    另加一个 created_at desc 索引让后台列表接口（按上传时间倒序）走索引。
create index if not exists idx_media_assets_created_at_desc
  on public.media_assets(created_at desc);
