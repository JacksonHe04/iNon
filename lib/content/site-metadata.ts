import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import { PUBLIC_PAGE_CACHE_TAG } from '@/lib/content/public-cache';

const METADATA_FIELDS = 'meta_title, meta_description, meta_author';

async function loadSiteMetadata() {
  const client = createAdminClient();
  const primary = await client
    .from('profiles')
    .select(METADATA_FIELDS)
    .eq('is_published', true)
    .or(`slug.eq.${DEFAULT_PROFILE_SLUG},username.eq.${DEFAULT_PROFILE_SLUG}`)
    .maybeSingle();

  const fallback = primary.data
    ? primary
    : await client
      .from('profiles')
      .select(METADATA_FIELDS)
      .eq('is_published', true)
      .eq('slug', '')
      .maybeSingle();

  if (fallback.error || !fallback.data) {
    throw fallback.error ?? new Error('Published profile metadata not found');
  }

  return {
    title: fallback.data.meta_title,
    description: fallback.data.meta_description,
    author: fallback.data.meta_author,
  };
}

export const getCachedSiteMetadata = unstable_cache(
  loadSiteMetadata,
  ['site-metadata'],
  { revalidate: 3600, tags: [PUBLIC_PAGE_CACHE_TAG] },
);
