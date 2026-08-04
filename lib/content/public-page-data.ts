import { getProfileIdBySlug } from '@/lib/analytics/profile-id';
import { createAdminClient } from '@/lib/supabase/admin';
import { unstable_cache } from 'next/cache';
import { DEFAULT_LAYOUT_CONFIG } from './default-layout';
import { DEFAULT_PROFILE_SLUG } from './constants';
import { getReadmeData, mapReadmeData } from './index';
import { getLayoutConfig, mergeWithDefaultLayoutConfig } from './layout';
import { normalizeAggregatedSourceData } from './readme-source-data';
import { deduplicateReadmeData } from './deduplicate';
import { PUBLIC_PAGE_CACHE_TAG } from './public-cache';
import type { ReadmeData } from '@/types';
import type { ProfileRow } from '@/types/database';
import type { LayoutConfig } from '@/types/layout';

type Resolution = 'direct' | 'alias' | 'default' | 'empty';

interface PublicPagePayload {
  profile: ProfileRow;
  layoutConfig: unknown;
  resolution: Resolution;
  source: unknown;
}

export interface PublicPageData {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
  profileId: string;
}

function resolvedLayout(slug: string, payload: PublicPagePayload): LayoutConfig {
  const missedNamedProfile = Boolean(slug) && ['default', 'empty'].includes(payload.resolution);
  return missedNamedProfile
    ? DEFAULT_LAYOUT_CONFIG
    : mergeWithDefaultLayoutConfig(payload.layoutConfig);
}

async function loadLegacyPublicPageData(slug: string): Promise<PublicPageData> {
  const [data, layoutConfig, profileId] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
    getProfileIdBySlug(slug),
  ]);
  return { data: deduplicateReadmeData(data), layoutConfig, profileId: profileId ?? '' };
}

async function loadPublicPageData(slug: string): Promise<PublicPageData> {
  const client = createAdminClient();
  const { data, error } = await client.rpc('read_public_profile_page', {
    target_identifier: slug,
    fallback_identifier: DEFAULT_PROFILE_SLUG,
  });
  if (error || !data || typeof data !== 'object' || Array.isArray(data)) {
    return loadLegacyPublicPageData(slug);
  }

  const payload = data as unknown as PublicPagePayload;
  const source = normalizeAggregatedSourceData(payload.source);
  if (!payload.profile?.id || !source) return loadLegacyPublicPageData(slug);

  return {
    data: deduplicateReadmeData(mapReadmeData(payload.profile, source)),
    layoutConfig: resolvedLayout(slug, payload),
    profileId: payload.profile.id,
  };
}

export const getPublicPageData = unstable_cache(
  loadPublicPageData,
  ['public-page-data'],
  { revalidate: 3600, tags: [PUBLIC_PAGE_CACHE_TAG] },
);
