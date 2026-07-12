import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  ensureStringArray,
  replaceProfileScopedRows,
  stringRows,
  withMutation,
} from './helpers';

export const updateWorkSection = withMutation<ReadmeData['work']>(
  async (adminClient, profileId, data) => {
    const { error: workMetaError } = await adminClient.from('work_meta').upsert({
      profile_id: profileId,
      current_job: ensureString(data.current_job),
    });
    if (workMetaError) throw workMetaError;

    await replaceProfileScopedRows(
      adminClient,
      'jobs',
      profileId,
      data.jobs.map((item, index) => ({
        profile_id: profileId,
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
      .eq('profile_id', profileId)
      .eq('list_type', 'work_preference');
    if (deletePrefsError) throw deletePrefsError;

    const prefRows = stringRows(
      profileId,
      'work_preference',
      ensureStringArray(data.work_preferences)
    );
    if (prefRows.length) {
      const { error } = await adminClient.from('profile_list_items').insert(prefRows);
      if (error) throw error;
    }
  }
);
