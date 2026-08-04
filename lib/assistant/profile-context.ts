import { unstable_cache } from 'next/cache';
import { getPublicPageData } from '@/lib/content/public-page-data';
import { PUBLIC_PAGE_CACHE_TAG } from '@/lib/content/public-cache';
import { readmeDataToMarkdown } from '@/lib/markdown';

async function loadAssistantProfileContext() {
  const pageData = await getPublicPageData('');
  const readmeData = pageData.data;
  return {
    readmeData,
    profileMarkdown: readmeDataToMarkdown(readmeData),
  };
}

export const getAssistantProfileContext = unstable_cache(
  loadAssistantProfileContext,
  ['assistant-profile-context'],
  { revalidate: 3600, tags: [PUBLIC_PAGE_CACHE_TAG] },
);
