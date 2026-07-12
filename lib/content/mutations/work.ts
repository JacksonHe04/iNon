import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  ensureStringArray,
  getProfile,
  replaceProfileScopedRows,
  stringRows,
} from './helpers';

export async function updateWorkSection(data: ReadmeData['work'], scope: MutationScope = { kind: 'admin' }) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  const { error: workMetaError } = await adminClient.from('work_meta').upsert({
    profile_id: profile.id,
    current_job: ensureString(data.current_job),
  });
  if (workMetaError) throw workMetaError;

  await replaceProfileScopedRows(
    adminClient,
    'jobs',
    profile.id,
    data.jobs.map((item, index) => ({
      profile_id: profile.id,
      company_name: ensureString(item.company_name),
      position: ensureString(item.position),
      position_type: ensureString(item.position_type),
      start_date: ensureString(item.start_date),
      end_date: ensureString(item.end_date),
      products_responsible_for: ensureString(item.products_responsible_for),
      job_summary: ensureString(item.job_summary),
      work_output: ensureString(item.work_output),
      sort_order: index,
    }))
  );

  const { error: deletePrefsError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .eq('list_type', 'work_preference');
  if (deletePrefsError) throw deletePrefsError;

  const prefRows = stringRows(
    profile.id,
    'work_preference',
    ensureStringArray(data.work_preferences)
  );
  if (prefRows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(prefRows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}
