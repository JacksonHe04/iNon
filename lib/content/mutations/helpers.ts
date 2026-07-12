import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';

export type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

export type MutationScope = { kind: 'admin' } | { kind: 'user'; userId: string };

export function ensureString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function ensureStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => ensureString(item)).filter(Boolean) : [];
}

export async function getProfile(adminClient: SupabaseAdminClient, scope: MutationScope = { kind: 'admin' }) {
  if (scope.kind === 'user') {
    const { data, error } = await adminClient
      .from('profiles')
      .select('id, slug, username')
      .eq('user_id', scope.userId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Profile not found for current user');
    return data;
  }

  const { getAdminContext } = await import('@/lib/admin/auth');
  const context = await getAdminContext();

  if (!context) {
    throw new Error('Unauthorized');
  }

  const { data: userProfile } = await adminClient
    .from('profiles')
    .select('id, slug, username')
    .eq('user_id', context.user.id)
    .maybeSingle();

  if (userProfile) {
    return userProfile;
  }

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, slug, username')
    .eq('slug', DEFAULT_PROFILE_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Profile "${DEFAULT_PROFILE_SLUG}" not found`);
  return data;
}

export async function replaceProfileScopedRows(
  adminClient: SupabaseAdminClient,
  table: string,
  profileId: string,
  rows: Record<string, unknown>[]
) {
  const { error: deleteError } = await adminClient
    .from(table)
    .delete()
    .eq('profile_id', profileId);
  if (deleteError) throw deleteError;

  if (!rows.length) return [];

  const { data, error } = await adminClient.from(table).insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

export async function replaceRelatedRows(
  adminClient: SupabaseAdminClient,
  table: string,
  key: string,
  ids: string[],
  rows: Record<string, unknown>[]
) {
  if (ids.length > 0) {
    const { error: deleteError } = await adminClient.from(table).delete().in(key, ids);
    if (deleteError) throw deleteError;
  }

  if (!rows.length) return [];

  const { data, error } = await adminClient.from(table).insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

export function stringRows(profileId: string, listType: string, values: string[]) {
  return values.map((value, index) => ({
    profile_id: profileId,
    list_type: listType,
    value,
    sort_order: index,
  }));
}

export function tagRows(profileId: string, tagType: string, values: string[]) {
  return values.map((value, index) => ({
    profile_id: profileId,
    tag_type: tagType,
    value,
    sort_order: index,
  }));
}
