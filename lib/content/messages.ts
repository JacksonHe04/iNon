import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';

/** 公开页展示用：不含 contact 等隐私字段 */
export type PublicMessage = {
  id: string;
  nickname: string;
  content: string;
  created_at: string;
};

/** 控制台留言管理用：含联系方式与可见状态 */
export type OwnerMessage = {
  id: string;
  nickname: string;
  content: string;
  contact: string;
  visible: boolean;
  created_at: string;
};

/**
 * 公开页可见留言（退出制：approved 即展示）。
 * 走 admin client 但严格按 profile_id + status 过滤，只读，无隐私字段。
 */
export async function listVisibleMessages(profileId: string): Promise<PublicMessage[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('messages')
    .select('id, nickname, content, created_at')
    .eq('profile_id', profileId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as PublicMessage[];
}

/**
 * 控制台：该 owner 的全部可管理留言（approved=显示 / rejected=隐藏）。
 * spam 不在管理列表出现。
 */
export async function listOwnerMessages(profileId: string): Promise<OwnerMessage[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('messages')
    .select('id, nickname, content, contact, status, created_at')
    .eq('profile_id', profileId)
    .in('status', ['approved', 'rejected'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    nickname: row.nickname,
    content: row.content,
    contact: row.contact,
    visible: row.status === 'approved',
    created_at: row.created_at,
  }));
}

/**
 * 切换单条留言在公开页的可见性。
 * 用 admin client 会绕过 RLS，因此必须校验该留言归属当前 owner（profileId）。
 */
export async function setMessageVisibility(
  messageId: string,
  visible: boolean,
  profileId: string
): Promise<void> {
  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from('messages')
    .select('id, profile_id')
    .eq('id', messageId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (!existing || existing.profile_id !== profileId) {
    throw new Error('留言不存在或无权操作');
  }

  // 取出 owner 的所有 slug（包含 aliases），确保公开页 / 控制台缓存都能被清掉
  const { data: profile } = await adminClient
    .from('profiles')
    .select('slug, profile_slugs(slug)')
    .eq('id', profileId)
    .maybeSingle();
  const ownerSlugs: string[] = [];
  if (profile) {
    if (profile.slug) ownerSlugs.push(profile.slug);
    const aliases = (profile as { profile_slugs?: Array<{ slug: string }> }).profile_slugs ?? [];
    for (const row of aliases) {
      if (row.slug) ownerSlugs.push(row.slug);
    }
  }

  const status = visible ? 'approved' : 'rejected';
  const { error } = await adminClient
    .from('messages')
    .update({
      status,
      approved_at: visible ? new Date().toISOString() : null,
    })
    .eq('id', messageId);

  if (error) throw error;

  // 公开页 / 控制台均涉及多种路径：根、所有公开 slug、控制台 slug、管理页。
  // 这里显式 revalidate 而非依赖父层布局 catch，确保公开页立刻反映隐藏/恢复。
  revalidatePath('/');
  for (const slug of ownerSlugs) {
    revalidatePath(`/${slug}`);
    revalidatePath(`/i/${slug}`);
  }
}
