import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { LayoutConfig } from '@/types/layout';

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

      return profileRow.layout_config as LayoutConfig;
    }

    return (data.layout_config as LayoutConfig) || DEFAULT_LAYOUT_CONFIG;
  } catch (err) {
    console.warn('Unexpected error reading layout_config:', err);
    return DEFAULT_LAYOUT_CONFIG;
  }
}