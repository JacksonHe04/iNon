import { loadProfile } from '@/lib/content/db-helpers';

/**
 * 公开页（/:slug）场景下，拿到 profile.id（用于统计写入）。
 * 与 getReadmeData 同源，但只查 profiles 表，少一次大查询。
 * 找不到返回 null（页面应正常降级，不阻塞）。
 */
export async function getProfileIdBySlug(slug: string): Promise<string | null> {
  const { data } = await loadProfile(slug);
  return data?.id ?? null;
}