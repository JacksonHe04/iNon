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

export async function updateContactSection(
  data: ReadmeData['contact'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(
    adminClient,
    'contact_methods',
    profile.id,
    data.contact_info.map((item, index) => ({
      profile_id: profile.id,
      method_name: ensureString(item.method_name),
      content: ensureString(item.content),
      sort_order: index,
    }))
  );

  await replaceProfileScopedRows(
    adminClient,
    'platform_accounts',
    profile.id,
    data.platform_accounts.map((item, index) => ({
      profile_id: profile.id,
      platform_name: ensureString(item.platform_name),
      username: ensureString(item.username),
      homepage_link: ensureString(item.homepage_link),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateThoughtsSection(
  data: ReadmeData['thoughts'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  const { error: deleteListError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', [
      'personal_philosophy',
      'industry_view',
      'ideology',
      'life_element',
      'macro_vision',
      'personal_vision',
    ]);
  if (deleteListError) throw deleteListError;

  const rows = [
    ...stringRows(profile.id, 'personal_philosophy', ensureStringArray(data.personal_philosophy)),
    ...stringRows(profile.id, 'industry_view', ensureStringArray(data.industry_views)),
    ...stringRows(profile.id, 'ideology', ensureStringArray(data.ideology)),
    ...stringRows(profile.id, 'life_element', ensureStringArray(data.life_elements)),
    ...stringRows(profile.id, 'macro_vision', ensureStringArray(data.macro_vision)),
    ...stringRows(profile.id, 'personal_vision', ensureStringArray(data.personal_vision)),
  ];
  if (rows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(rows);
    if (error) throw error;
  }

  await replaceProfileScopedRows(
    adminClient,
    'thought_qa',
    profile.id,
    data.qa.map((item, index) => ({
      profile_id: profile.id,
      question: ensureString(item.question),
      answer: ensureString(item.answer),
      source: ensureString(item.source),
      qa_date: ensureString(item.date),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateNotificationsSection(
  data: ReadmeData['notifications'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(
    adminClient,
    'notifications',
    profile.id,
    data.map((item, index) => ({
      profile_id: profile.id,
      notification_date: ensureString(item.date),
      text: ensureString(item.text),
      type: ensureString(item.type),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateMessageStatus(messageId: string, status: 'approved' | 'rejected' | 'spam') {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('messages')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', messageId);
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin/messages');
}
