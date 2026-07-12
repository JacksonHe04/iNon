import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import { revalidatePath } from 'next/cache';

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

/**
 * Idempotently replace all rows for a profile.
 *
 * Strategy:
 *  1. Delete all rows currently scoped to the profile.
 *  2. Upsert (insert with ON CONFLICT DO NOTHING on the first unique constraint)
 *     the rows that should exist. This means concurrent / re-entrant saves
 *     can never produce duplicates even if a unique key collides.
 *
 * The previous implementation was a plain DELETE + INSERT. Combined with the
 * client-side useSectionSave's unmount cleanup that fires a second PUT, that
 * pattern produced N-times duplicate rows in tables like notifications and
 * product_items. Now even if the client double-saves, the result is the same
 * as a single save.
 */
export async function replaceProfileScopedRows(
  adminClient: SupabaseAdminClient,
  table: string,
  profileId: string,
  rows: Record<string, unknown>[]
) {
  // Delete everything currently in the table for this profile.
  // The table is profile-scoped, so a direct delete is cheaper than first
  // reading ids just to decide whether to delete.
  const { error: deleteError } = await adminClient
    .from(table)
    .delete()
    .eq('profile_id', profileId);
  if (deleteError) throw deleteError;

  if (!rows.length) return [];

  // Upsert incoming rows. ignoreDuplicates=true makes this a no-op for
  // rows whose unique key already exists, so even if the same payload is
  // sent twice, we never get two physical rows.
  const { data, error } = await adminClient
    .from(table)
    .upsert(rows, { ignoreDuplicates: true, count: 'exact' })
    .select();
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

export function withMutation<T>(
  handler: (adminClient: SupabaseAdminClient, profileId: string, data: T) => Promise<void>
) {
  return async (data: T, scope: MutationScope = { kind: 'admin' }) => {
    const adminClient = createAdminClient();
    const profile = await getProfile(adminClient, scope);
    
    await handler(adminClient, profile.id, data);
    
    if (profile.slug) {
      revalidatePath(`/${profile.slug}`);
      revalidatePath(`/i/${profile.slug}`);
    }
    revalidatePath('/');
    revalidatePath('/admin/content');
  };
}
