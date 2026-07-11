-- =============================================================================
-- 为 11 张「可展示图片」的表加 image_url 列
-- =============================================================================
-- 语义：block 子表和 legacy 简历表的"封面图 / 配图"字段。
--       值可以是我们自己 media_assets 图床的 public_url，也可以是任何外链。
--       字段是字符串 URL，不再做外键关联。
-- 分组：
--   - legacy 套（已有真实数据，加列默认 null 不破坏）：
--       media_items / product_items / creation_items / hardware_items
--   - block 套（行数为 0，按 block_type_registry 与 user_blocks 模型预设）：
--       user_media_items / user_projects / user_shortcuts
--       friend_links / timeline_events / ai_agent_configs
-- 所有列均为可空，语义为「无图时为空」。
-- =============================================================================

-- legacy 套
alter table public.media_items
  add column if not exists image_url text;

alter table public.product_items
  add column if not exists image_url text;

alter table public.creation_items
  add column if not exists image_url text;

alter table public.hardware_items
  add column if not exists image_url text;

-- block 套
alter table public.user_media_items
  add column if not exists image_url text;

alter table public.user_projects
  add column if not exists image_url text;

alter table public.user_shortcuts
  add column if not exists image_url text;

alter table public.friend_links
  add column if not exists image_url text;

alter table public.timeline_events
  add column if not exists image_url text;

alter table public.ai_agent_configs
  add column if not exists image_url text;
