import { cache } from 'react';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { ReadmeData } from '@/types';
import type { ProfileRow } from '@/types/database';
import { loadProfile } from './db-helpers';
import {
  mapProfileAndBasic,
  mapLife,
  mapExperience,
  mapEducation,
  mapWork,
  mapDevelopment,
  mapProducts,
  mapCreation,
  mapLibrary,
  mapEvents,
  mapContact,
  mapThoughts,
  mapNotifications,
} from './mappers';
import { loadReadmeSourceData, type ReadmeSourceData } from './readme-source-data';

const loadResolvedProfile = cache(async (slug: string): Promise<ProfileRow> => {
  let profileResult = await loadProfile(slug);
  if (!profileResult.data && slug !== DEFAULT_PROFILE_SLUG) {
    profileResult = await loadProfile(DEFAULT_PROFILE_SLUG);
  }
  if (!profileResult.data) {
    profileResult = await loadProfile('');
  }
  if (profileResult.error || !profileResult.data) {
    throw profileResult.error ?? new Error(`Profile "${slug}" not found`);
  }
  return profileResult.data;
});

export async function getSiteMetadata() {
  const profile = await loadResolvedProfile(DEFAULT_PROFILE_SLUG);
  return {
    title: profile.meta_title,
    description: profile.meta_description,
    author: profile.meta_author,
  };
}

export function mapReadmeData(profile: ProfileRow, sourceData: ReadmeSourceData): ReadmeData {
  return {
    ...mapProfileAndBasic(profile, sourceData.tags),
    life: mapLife(sourceData.life, sourceData.listItems),
    experience: mapExperience(sourceData.experiences),
    education: mapEducation(sourceData.schools, sourceData.educationMeta),
    work: mapWork(sourceData.jobs, sourceData.workMeta, sourceData.listItems),
    development: mapDevelopment(
      sourceData.developmentSkills,
      sourceData.projects,
      sourceData.projectTechStack,
      sourceData.projectRoles,
      sourceData.devTools,
      sourceData.devToolTags,
    ),
    products: mapProducts(sourceData.productItems, sourceData.productItemTags, sourceData.hardwareItems),
    creation: mapCreation(sourceData.creationItems, sourceData.listItems),
    library: mapLibrary(sourceData.libraryItems, sourceData.libraryCategories),
    events: mapEvents(sourceData.performances),
    contact: mapContact(sourceData.contactMethods, sourceData.platformAccounts),
    thoughts: mapThoughts(sourceData.listItems, sourceData.thoughtQa),
    notifications: mapNotifications(sourceData.notifications),
    messages: sourceData.messages,
  };
}

export async function getReadmeData(slug = DEFAULT_PROFILE_SLUG): Promise<ReadmeData> {
  try {
    const profile = await loadResolvedProfile(slug);
    const sourceData = await loadReadmeSourceData(profile.id);
    return mapReadmeData(profile, sourceData);
  } catch (error) {
    throw new Error(`Failed to load readme data from Supabase: ${(error as Error).message}`);
  }
}
