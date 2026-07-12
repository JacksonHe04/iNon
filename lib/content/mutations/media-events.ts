import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  getProfile,
  replaceProfileScopedRows,
  SupabaseAdminClient,
} from './helpers';
import { dedupeBy } from '../mappers/utils';

/**
 * Drop inbound rows whose business content is identical before persisting.
 * `replaceMediaDomain` is "delete-all-then-insert", so duplicates in the input
 * would otherwise be written straight back to the DB. We deduplicate using the
 * same keys the reader uses, so the source of truth stays consistent.
 */
function dedupeMediaRows<T extends Record<string, unknown>>(
  rows: T[],
  keys: (keyof T)[]
): T[] {
  return dedupeBy(rows, keys);
}

async function replaceMediaDomain(
  adminClient: SupabaseAdminClient,
  profileId: string,
  domain: 'reading' | 'films' | 'music' | 'hiphop',
  rows: Record<string, unknown>[]
) {
  const { error: deleteError } = await adminClient
    .from('media_items')
    .delete()
    .eq('profile_id', profileId)
    .eq('domain', domain);
  if (deleteError) throw deleteError;

  if (rows.length) {
    const { error } = await adminClient.from('media_items').insert(rows);
    if (error) throw error;
  }
}

export async function updateReadingSection(
  data: ReadmeData['reading'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceMediaDomain(adminClient, profile.id, 'reading', dedupeMediaRows([
    ...data.books.map((item, index) => ({
      profile_id: profile.id,
      domain: 'reading',
      item_type: 'book',
      name: ensureString(item.name),
      creator: ensureString(item.author),
      album: '',
      country_or_region: ensureString(item.country),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.authors.map((item, index) => ({
      profile_id: profile.id,
      domain: 'reading',
      item_type: 'author',
      name: ensureString(item.name),
      creator: '',
      album: '',
      country_or_region: ensureString(item.country),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: data.books.length + index,
    })),
  ], ['domain', 'item_type', 'name', 'creator', 'country_or_region']));

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateFilmsSection(data: ReadmeData['films'], scope: MutationScope = { kind: 'admin' }) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceMediaDomain(adminClient, profile.id, 'films', dedupeMediaRows([
    ...data.films.map((item, index) => ({
      profile_id: profile.id,
      domain: 'films',
      item_type: 'film',
      name: ensureString(item.name),
      creator: ensureString(item.director),
      album: '',
      country_or_region: ensureString(item.country),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.directors.map((item, index) => ({
      profile_id: profile.id,
      domain: 'films',
      item_type: 'director',
      name: ensureString(item.name),
      creator: '',
      album: '',
      country_or_region: ensureString(item.country),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: data.films.length + index,
    })),
  ], ['domain', 'item_type', 'name', 'creator', 'country_or_region']));

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateMusicSection(
  section: 'music' | 'hiphop',
  data: ReadmeData['music'] | ReadmeData['hiphop'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceMediaDomain(adminClient, profile.id, section, dedupeMediaRows([
    ...data.albums.map((item, index) => ({
      profile_id: profile.id,
      domain: section,
      item_type: 'album',
      name: ensureString(item.name),
      creator: ensureString(item.artist),
      album: '',
      country_or_region: '',
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.songs.map((item, index) => ({
      profile_id: profile.id,
      domain: section,
      item_type: 'song',
      name: ensureString(item.name),
      creator: ensureString(item.artist),
      album: ensureString(item.album),
      country_or_region: '',
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: data.albums.length + index,
    })),
    ...data.musicians.map((item, index) => ({
      profile_id: profile.id,
      domain: section,
      item_type: 'musician',
      name: ensureString(item.name),
      creator: '',
      album: '',
      country_or_region: ensureString(item.region),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      image_url: ensureString(item.image_url),
      sort_order: data.albums.length + data.songs.length + index,
    })),
  ], ['domain', 'item_type', 'name', 'creator', 'album', 'country_or_region']));

  revalidatePath('/');
  revalidatePath('/admin/content');
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
