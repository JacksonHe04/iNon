-- Drop 占位/孤儿 Block 表
-- 背景：20260712052100_add_image_url_to_block_tables.sql 中对这些表执行了
-- `alter table ... add column image_url`，但代码库中（.ts/.tsx）从未
-- 通过 .from(...) 或 listTable(...) 引用这些表。Block 系统已走完全不同的
-- 路径（media_assets + library_items + layout_config JSONB）。
--
-- 本迁移将它们从数据库中删除，避免误导后续开发者。

drop table if exists public.user_media_items cascade;
drop table if exists public.user_projects cascade;
drop table if exists public.user_shortcuts cascade;
drop table if exists public.timeline_events cascade;
drop table if exists public.ai_agent_configs cascade;
drop table if exists public.friend_links cascade;