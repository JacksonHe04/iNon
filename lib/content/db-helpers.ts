import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QueryResult, MaybeSingleResult, ProfileRow } from '@/types/database';

type AnyClient = SupabaseClient;

async function resolveClient(client?: AnyClient | null): Promise<AnyClient> {
  if (client) return client;
  return createAdminClient();
}

export async function listTable<T>(
  table: string,
  profileId: string,
  select = '*',
  client?: AnyClient | null,
): Promise<QueryResult<T>> {
  const supabase = await resolveClient(client);
  const response = await supabase
    .from(table)
    .select(select)
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: true });

  return {
    data: (response.data as T[] | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

export async function maybeSingleByProfile<T>(
  table: string,
  profileId: string,
  select = '*',
  client?: AnyClient | null,
): Promise<MaybeSingleResult<T>> {
  const supabase = await resolveClient(client);
  const response = await supabase
    .from(table)
    .select(select)
    .eq('profile_id', profileId)
    .maybeSingle();

  return {
    data: (response.data as T | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

export async function listByForeignIds<T>(
  table: string,
  key: string,
  ids: string[],
  select = '*',
  client?: AnyClient | null,
): Promise<QueryResult<T>> {
  if (!ids.length) {
    return { data: [], error: null };
  }

  const supabase = await resolveClient(client);
  const response = await supabase
    .from(table)
    .select(select)
    .in(key, ids)
    .order('sort_order', { ascending: true });

  return {
    data: (response.data as T[] | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

export async function loadProfile(
  identifier: string,
  client?: AnyClient | null,
): Promise<MaybeSingleResult<ProfileRow>> {
  const supabase = await resolveClient(client);

  // 1. Check profiles by slug or username
  let query = supabase
    .from('profiles')
    .select('id, slug, username, name, intro, current_status, meta_title, meta_description, meta_author')
    .eq('is_published', true);

  if (identifier) {
    query = query.or(`slug.eq.${identifier},username.eq.${identifier}`);
  } else {
    // If identifier is empty string (root / or /i), try searching slug = '' or fallback
    query = query.eq('slug', '');
  }

  const response = await query.maybeSingle();
  if (response.data) {
    return {
      data: response.data as ProfileRow,
      error: null,
    };
  }

  // 2. Check profile_slugs table for alias slugs
  try {
    const slugRes = await supabase
      .from('profile_slugs')
      .select('profile_id')
      .eq('slug', identifier ?? '')
      .maybeSingle();

    if (slugRes.data?.profile_id) {
      const profRes = await supabase
        .from('profiles')
        .select('id, slug, username, name, intro, current_status, meta_title, meta_description, meta_author')
        .eq('id', slugRes.data.profile_id)
        .eq('is_published', true)
        .maybeSingle();

      if (profRes.data) {
        return {
          data: profRes.data as ProfileRow,
          error: null,
        };
      }
    }
  } catch (_e) {
    // profile_slugs table might not exist yet
  }

  return {
    data: null,
    error: response.error ? new Error(response.error.message) : null,
  };
}
