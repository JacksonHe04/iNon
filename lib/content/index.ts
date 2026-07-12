import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { ReadmeData } from '@/types';
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
import { loadReadmeSourceData } from './readme-source-data';

export async function getReadmeData(slug = DEFAULT_PROFILE_SLUG): Promise<ReadmeData> {
  try {
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

    const profile = profileResult.data;
    const sourceData = await loadReadmeSourceData(profile.id);

    const profileAndBasic = mapProfileAndBasic(profile, sourceData.tags);
    const life = mapLife(sourceData.life, sourceData.listItems);
    const experience = mapExperience(sourceData.experiences);
    const education = mapEducation(sourceData.schools, sourceData.educationMeta);
    const work = mapWork(sourceData.jobs, sourceData.workMeta, sourceData.listItems);
    const development = mapDevelopment(
      sourceData.developmentSkills,
      sourceData.projects,
      sourceData.projectTechStack,
      sourceData.projectRoles,
      sourceData.devTools,
      sourceData.devToolTags
    );
    const products = mapProducts(sourceData.productItems, sourceData.productItemTags, sourceData.hardwareItems);
    const creation = mapCreation(sourceData.creationItems, sourceData.listItems);
    const library = mapLibrary(sourceData.libraryItems, sourceData.libraryCategories);
    const events = mapEvents(sourceData.performances);
    const contact = mapContact(sourceData.contactMethods, sourceData.platformAccounts);
    const thoughts = mapThoughts(sourceData.listItems, sourceData.thoughtQa);
    const notifications = mapNotifications(sourceData.notifications);

    return {
      ...profileAndBasic,
      life,
      experience,
      education,
      work,
      development,
      products,
      creation,
      library,
      events,
      contact,
      thoughts,
      notifications,
      messages: sourceData.messages,
    };
  } catch (error) {
    throw new Error(`Failed to load readme data from Supabase: ${(error as Error).message}`);
  }
}
