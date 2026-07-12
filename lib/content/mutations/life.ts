import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  ensureStringArray,
  getProfile,
  stringRows,
} from './helpers';

export async function updateLifeSection(data: ReadmeData['life'], scope: MutationScope = { kind: 'admin' }) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  const { error: lifeError } = await adminClient.from('profile_life').upsert({
    profile_id: profile.id,
    current_city: ensureString(data.current_city),
    birth_date: ensureString(data.birth_date),
    zodiac_sign: ensureString(data.zodiac_sign),
    life_mbti: ensureString(data.mbti?.life_mbti),
    work_mbti: ensureString(data.mbti?.work_mbti),
  });
  if (lifeError) throw lifeError;

  const keepTypes = [
    'habit',
    'favorite_food',
    'favorite_drink',
  ];
  const { error: deleteError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', keepTypes);
  if (deleteError) throw deleteError;

  const rows = [
    ...stringRows(profile.id, 'habit', ensureStringArray(data.habits)),
    ...stringRows(profile.id, 'favorite_food', ensureStringArray(data.diet.favorite_food)),
    ...stringRows(profile.id, 'favorite_drink', ensureStringArray(data.diet.favorite_drinks)),
  ];
  if (rows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(rows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}
