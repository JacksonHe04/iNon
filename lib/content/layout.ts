import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { LayoutConfig, BlockConfig, NavSectionConfig } from '@/types/layout';

/**
 * 辅助函数：将用户数据库中保存的 layout_config 与系统默认配置 DEFAULT_LAYOUT_CONFIG 进行合并。
 * 保证新增的原子 Block 组件能自动出现在已有用户的配置列表中（以默认可见度与大小呈现），
 * 同时保留用户已有 Block 的排序、宽度及可见度设置。
 */
export function mergeWithDefaultLayoutConfig(userConfig: any): LayoutConfig {
  if (!userConfig || typeof userConfig !== 'object') {
    return DEFAULT_LAYOUT_CONFIG;
  }

  const dbBlocks = (Array.isArray(userConfig.blocks) ? userConfig.blocks : []) as BlockConfig[];
  const dbNavs = (Array.isArray(userConfig.navSections) ? userConfig.navSections : []) as NavSectionConfig[];

  // 合并 Blocks：保留用户已有的设置，补全系统默认新增的 Block
  const mergedBlocks = [...dbBlocks];
  for (const defBlock of DEFAULT_LAYOUT_CONFIG.blocks) {
    const exists = dbBlocks.some(
      (b) => b.blockType === defBlock.blockType || b.id === defBlock.id
    );
    if (!exists) {
      mergedBlocks.push(defBlock);
    }
  }

  // 合并 navSections：保留用户已有的，补全系统默认新增的
  const mergedNavs = [...dbNavs];
  for (const defNav of DEFAULT_LAYOUT_CONFIG.navSections) {
    const exists = dbNavs.some((n) => n.id === defNav.id);
    if (!exists) {
      mergedNavs.push(defNav);
    }
  }

  return {
    blocks: mergedBlocks,
    navSections: mergedNavs,
  };
}

/**
 * 服务端读取 profile 的 layout_config。
 * 用于公开页与控制台在初始渲染时拿到用户保存的 Block 画板配置，
 * 避免每次进入页面都退化到默认排版。
 *
 * 读取失败或不存在时返回 DEFAULT_LAYOUT_CONFIG，保证调用方无需做空判断。
 *
 * slug 为空（表示 `/` 或 `/i` 根路径）时退到 DEFAULT_PROFILE_SLUG，
 * 因为空 slug 实际承载的是默认登录用户的 profile。
 */
export async function getLayoutConfig(slug = DEFAULT_PROFILE_SLUG): Promise<LayoutConfig> {
  const effectiveSlug = slug || DEFAULT_PROFILE_SLUG;

  try {
    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from('profiles')
      .select('id, layout_config')
      .or(`slug.eq.${effectiveSlug},username.eq.${effectiveSlug}`)
      .maybeSingle();

    if (error) {
      console.warn('Failed to query layout_config for slug "%s": %s', effectiveSlug, error.message);
      return DEFAULT_LAYOUT_CONFIG;
    }

    if (!data) {
      const { data: aliasRow, error: aliasError } = await adminClient
        .from('profile_slugs')
        .select('profile_id')
        .eq('slug', effectiveSlug)
        .maybeSingle();

      if (aliasError || !aliasRow?.profile_id) {
        return DEFAULT_LAYOUT_CONFIG;
      }

      const { data: profileRow, error: profileError } = await adminClient
        .from('profiles')
        .select('layout_config')
        .eq('id', aliasRow.profile_id)
        .maybeSingle();

      if (profileError || !profileRow?.layout_config) {
        return DEFAULT_LAYOUT_CONFIG;
      }

      return mergeWithDefaultLayoutConfig(profileRow.layout_config);
    }

    return mergeWithDefaultLayoutConfig(data.layout_config);
  } catch (err) {
    console.warn('Unexpected error reading layout_config:', err);
    return DEFAULT_LAYOUT_CONFIG;
  }
}