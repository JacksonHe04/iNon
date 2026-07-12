import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  ensureStringArray,
  getProfile,
  replaceProfileScopedRows,
  tagRows,
} from './helpers';

export async function updateProfileSection(
  data: Pick<ReadmeData, 'meta' | 'basic'>,
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      name: ensureString(data.basic.name),
      intro: ensureString(data.basic.intro),
      current_status: ensureString(data.basic.current_status),
      meta_title: ensureString(data.meta.title),
      meta_description: ensureString(data.meta.description),
      meta_author: ensureString(data.meta.author),
    })
    .eq('id', profile.id);
  if (profileError) throw profileError;

  await replaceProfileScopedRows(adminClient, 'profile_tags', profile.id, [
    ...tagRows(profile.id, 'keyword', ensureStringArray(data.basic.keywords)),
    ...tagRows(profile.id, 'value', ensureStringArray(data.basic.values)),
    ...tagRows(profile.id, 'tag', ensureStringArray(data.basic.tags)),
  ]);

  revalidatePath('/');
  revalidatePath('/i');
  revalidatePath('/admin/content');
  if (profile.username) {
    revalidatePath(`/${profile.username}`);
    revalidatePath(`/i/${profile.username}`);
  }
  if (profile.slug) {
    revalidatePath(`/${profile.slug}`);
    revalidatePath(`/i/${profile.slug}`);
  }
}
