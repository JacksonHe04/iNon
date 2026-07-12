import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  getProfile,
  replaceProfileScopedRows,
} from './helpers';

export async function updateExperienceSection(
  data: ReadmeData['experience'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(
    adminClient,
    'experiences',
    profile.id,
    data.experience.map((item, index) => ({
      profile_id: profile.id,
      city: ensureString(item.city),
      event_date: ensureString(item.date),
      description: ensureString(item.description),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateEducationSection(
  data: ReadmeData['education'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(
    adminClient,
    'schools',
    profile.id,
    data.schools.map((item, index) => ({
      profile_id: profile.id,
      degree: ensureString(item.degree),
      major: ensureString(item.major),
      institution: ensureString(item.institution),
      start_date: ensureString(item.start_date),
      end_date: ensureString(item.end_date),
      sort_order: index,
    }))
  );

  const { error } = await adminClient.from('education_meta').upsert({
    profile_id: profile.id,
    undergraduate_major: ensureString(data.undergraduate_major),
    undergraduate_advisor: ensureString(data.undergraduate_advisor),
  });
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin/content');
}
