import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData, LibraryByKind, LibraryKind } from '@/types';
import {
  MutationScope,
  ensureString,
  getProfile,
  SupabaseAdminClient,
  replaceProfileScopedRows,
} from './helpers';

export async function updateLibrarySection(
  payload: LibraryByKind,
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  // Delete all existing items and categories
  const { error: deleteItemsError } = await adminClient
    .from('library_items')
    .delete()
    .eq('profile_id', profile.id);
  if (deleteItemsError) throw deleteItemsError;

  const { error: deleteCategoriesError } = await adminClient
    .from('library_categories')
    .delete()
    .eq('profile_id', profile.id);
  if (deleteCategoriesError) throw deleteCategoriesError;

  // Insert categories
  const categoriesToInsert = [];
  for (const kind of ['music', 'film', 'game', 'book'] as LibraryKind[]) {
    const kindData = payload[kind];
    if (kindData && kindData.categories) {
      for (const cat of kindData.categories) {
        categoriesToInsert.push({
          profile_id: profile.id,
          kind,
          name: cat.name,
          sort_order: cat.sortOrder,
        });
      }
    }
  }

  let insertedCategories: { id: string; kind: string; name: string }[] = [];
  if (categoriesToInsert.length > 0) {
    const { data, error } = await adminClient
      .from('library_categories')
      .insert(categoriesToInsert)
      .select('id, kind, name');
    if (error) throw error;
    insertedCategories = data || [];
  }

  const categoryLookup = new Map<string, string>();
  for (const cat of insertedCategories) {
    categoryLookup.set(`${cat.kind}:${cat.name}`, cat.id);
  }

  // Insert items
  const itemsToInsert = [];
  for (const kind of ['music', 'film', 'game', 'book'] as LibraryKind[]) {
    const kindData = payload[kind];
    if (!kindData) continue;

    const subtypes = ['work', 'creator'];
    if (kind === 'music') {
      subtypes.push('song');
    }

    for (const subtype of subtypes) {
      const itemsList = (kindData as any)[subtype === 'work' ? 'works' : subtype === 'creator' ? 'creators' : 'songs'] || [];
      for (const item of itemsList) {
        const categoryKey = item.categoryName ? `${kind}:${item.categoryName}` : '';
        const categoryId = categoryKey ? (categoryLookup.get(categoryKey) || null) : null;

        itemsToInsert.push({
          profile_id: profile.id,
          kind,
          subtype,
          category_id: categoryId,
          name: ensureString(item.name),
          creator: ensureString(item.creator),
          link: ensureString(item.link),
          comment: ensureString(item.comment),
          image_url: item.imageUrl ? ensureString(item.imageUrl) : null,
          sort_order: item.sortOrder ?? 0,
        });
      }
    }
  }

  if (itemsToInsert.length > 0) {
    const { error: insertItemsError } = await adminClient
      .from('library_items')
      .insert(itemsToInsert);
    if (insertItemsError) throw insertItemsError;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
  if (profile.slug) {
    revalidatePath(`/${profile.slug}`);
    revalidatePath(`/i/${profile.slug}`);
  }
}


export async function updateEventsSection(
  data: ReadmeData['events'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(
    adminClient,
    'performances',
    profile.id,
    data.performances.map((item, index) => ({
      profile_id: profile.id,
      event_type: ensureString(item.type),
      name: ensureString(item.name),
      event_date: ensureString(item.date),
      genre: ensureString(item.genre),
      location: ensureString(item.location),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}
