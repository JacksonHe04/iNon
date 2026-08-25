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

/**
 * 数据库彻底不可用（如 Vercel Postgres 配额超限）时的安全降级数据。
 * 保证页面始终能渲染（返回 200），而不是抛错导致 500。
 */
export const EMPTY_README_DATA: ReadmeData = {
  meta: { title: '', description: '', author: '' },
  basic: { name: '', intro: '', current_status: '', keywords: [], values: [], tags: [] },
  life: {
    current_city: '',
    mbti: { life_mbti: '', work_mbti: '' },
    birth_date: '',
    zodiac_sign: '',
    habits: [],
    diet: { favorite_food: [], favorite_drinks: [] },
  },
  experience: { experience: [] },
  education: { schools: [], undergraduate_major: '', undergraduate_advisor: '' },
  work: { current_job: '', jobs: [], work_preferences: [] },
  development: {
    skills: { tech_stack: [], expertise: [] },
    projects: [],
    dev_tools: [],
  },
  products: {
    favorite_products: [],
    recommended_products: [],
    my_hardware: { phone: '', computer: '', tablet: '', smartwatch: '', headphones: [] },
    favorite_brands: [],
  },
  creation: { videos: [], articles: [], speeches: [], mottos: [], quotes: [] },
  library: {
    music: { categories: [], works: [], songs: [], creators: [] },
    film: { categories: [], works: [], creators: [] },
    game: { categories: [], works: [], creators: [] },
    book: { categories: [], works: [], creators: [] },
  },
  events: { performances: [] },
  contact: { contact_info: [], platform_accounts: [] },
  thoughts: {
    personal_philosophy: [],
    industry_views: [],
    ideology: [],
    life_elements: [],
    macro_vision: [],
    personal_vision: [],
    qa: [],
  },
  notifications: [],
  messages: [],
};

async function loadLegacyPublicPageData(slug: string): Promise<PublicPageData | null> {
  try {
    const [data, layoutConfig, profileId] = await Promise.all([
      getReadmeData(slug),
      getLayoutConfig(slug),
      getProfileIdBySlug(slug),
    ]);
    return { data: deduplicateReadmeData(data), layoutConfig, profileId: profileId ?? '' };
  } catch (err) {
    console.warn('Legacy public page load failed for slug "%s": %s', slug, (err as Error).message);
    return null;
  }
}

async function loadPublicPageData(slug: string): Promise<PublicPageData> {
  try {
    const client = createAdminClient();
    const { data, error } = await client.rpc('read_public_profile_page', {
      target_identifier: slug,
      fallback_identifier: DEFAULT_PROFILE_SLUG,
    });
    if (!error && data && typeof data === 'object' && !Array.isArray(data)) {
      const payload = data as unknown as PublicPagePayload;
      const source = normalizeAggregatedSourceData(payload.source);
      if (payload.profile?.id && source) {
        return {
          data: deduplicateReadmeData(mapReadmeData(payload.profile, source)),
          layoutConfig: resolvedLayout(slug, payload),
          profileId: payload.profile.id,
        };
      }
    }

    const legacy = await loadLegacyPublicPageData(slug);
    if (legacy) return legacy;
  } catch (err) {
    console.warn('Public page data load failed for slug "%s": %s', slug, (err as Error).message);
  }

  // 数据库整体不可用时降级：返回默认布局 + 空内容，避免整页 500。
  return { data: EMPTY_README_DATA, layoutConfig: DEFAULT_LAYOUT_CONFIG, profileId: '' };
}

export const getPublicPageData = unstable_cache(
  loadPublicPageData,
  ['public-page-data'],
  { revalidate: 3600, tags: [PUBLIC_PAGE_CACHE_TAG] },
);
