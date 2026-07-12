import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { ReadmeData } from '@/types';
import {
  listTable,
  maybeSingleByProfile,
  listByForeignIds,
  loadProfile,
} from './db-helpers';
import {
  mapProfileAndBasic,
  mapLife,
  mapExperience,
  mapEducation,
  mapWork,
  mapDevelopment,
  mapProducts,
  mapCreation,
  mapMedia,
  mapEvents,
  mapContact,
  mapThoughts,
  mapNotifications,
  sortByOrder,
  groupByKey,
} from './mappers';
import type {
  ProfileLifeRow,
  ValueRow,
  ExperienceRow,
  SchoolRow,
  EducationMetaRow,
  WorkMetaRow,
  JobRow,
  DevelopmentSkillRow,
  ProjectRow,
  DevToolRow,
  ProductItemRow,
  HardwareItemRow,
  CreationItemRow,
  MediaItemRow,
  PerformanceRow,
  ContactMethodRow,
  PlatformAccountRow,
  ThoughtQaRow,
  NotificationRow,
  ProjectListRow,
  DevToolTagRow,
  ProductItemTagRow,
} from '@/types/database';

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

    const [
      lifeResult,
      tagsResult,
      listItemsResult,
      experiencesResult,
      schoolsResult,
      educationMetaResult,
      workMetaResult,
      jobsResult,
      developmentSkillsResult,
      projectsResult,
      devToolsResult,
      productItemsResult,
      hardwareItemsResult,
      creationItemsResult,
      mediaItemsResult,
      performancesResult,
      contactMethodsResult,
      platformAccountsResult,
      thoughtQaResult,
      notificationsResult,
    ] = await Promise.all([
      maybeSingleByProfile<ProfileLifeRow>('profile_life', profile.id),
      listTable<(ValueRow & { tag_type: string })>('profile_tags', profile.id),
      listTable<(ValueRow & { list_type: string })>('profile_list_items', profile.id),
      listTable<ExperienceRow>('experiences', profile.id),
      listTable<SchoolRow>('schools', profile.id),
      maybeSingleByProfile<EducationMetaRow>('education_meta', profile.id),
      maybeSingleByProfile<WorkMetaRow>('work_meta', profile.id),
      listTable<JobRow>('jobs', profile.id),
      listTable<DevelopmentSkillRow>('development_skills', profile.id),
      listTable<ProjectRow>('projects', profile.id),
      listTable<DevToolRow>('dev_tools', profile.id),
      listTable<ProductItemRow>('product_items', profile.id),
      listTable<HardwareItemRow>('hardware_items', profile.id),
      listTable<CreationItemRow>('creation_items', profile.id),
      listTable<MediaItemRow>('media_items', profile.id),
      listTable<PerformanceRow>('performances', profile.id),
      listTable<ContactMethodRow>('contact_methods', profile.id),
      listTable<PlatformAccountRow>('platform_accounts', profile.id),
      listTable<ThoughtQaRow>('thought_qa', profile.id),
      listTable<NotificationRow>('notifications', profile.id),
    ]);

    const allErrors = [
      lifeResult.error,
      tagsResult.error,
      listItemsResult.error,
      experiencesResult.error,
      schoolsResult.error,
      educationMetaResult.error,
      workMetaResult.error,
      jobsResult.error,
      developmentSkillsResult.error,
      projectsResult.error,
      devToolsResult.error,
      productItemsResult.error,
      hardwareItemsResult.error,
      creationItemsResult.error,
      mediaItemsResult.error,
      performancesResult.error,
      contactMethodsResult.error,
      platformAccountsResult.error,
      thoughtQaResult.error,
      notificationsResult.error,
    ].filter(Boolean);

    if (allErrors.length > 0) {
      throw allErrors[0];
    }

    const tags = tagsResult.data ?? [];
    const listItems = listItemsResult.data ?? [];
    const projects = sortByOrder(projectsResult.data ?? []);
    const productItems = sortByOrder(productItemsResult.data ?? []);
    const mediaItems = sortByOrder(mediaItemsResult.data ?? []);
    const creationItems = sortByOrder(creationItemsResult.data ?? []);
    const hardwareItems = sortByOrder(hardwareItemsResult.data ?? []);
    const projectIds = projects.map((project) => project.id);
    const devToolIds = sortByOrder(devToolsResult.data ?? []).map((tool) => tool.id);
    const productItemIds = productItems.map((item) => item.id);

    const [
      projectRolesResult,
      projectTechStackResult,
      devToolTagsResult,
      productItemTagsResult,
    ] = await Promise.all([
      listByForeignIds<ProjectListRow>('project_roles', 'project_id', projectIds, 'project_id, value, sort_order'),
      listByForeignIds<ProjectListRow>('project_tech_stack', 'project_id', projectIds, 'project_id, value, sort_order'),
      listByForeignIds<DevToolTagRow>('dev_tool_tags', 'dev_tool_id', devToolIds, 'dev_tool_id, value, sort_order'),
      listByForeignIds<ProductItemTagRow>('product_item_tags', 'product_item_id', productItemIds, 'product_item_id, value, sort_order'),
    ]);

    const relationErrors = [
      projectRolesResult.error,
      projectTechStackResult.error,
      devToolTagsResult.error,
      productItemTagsResult.error,
    ].filter(Boolean);
    if (relationErrors.length > 0) {
      throw relationErrors[0];
    }

    const projectRoles = groupByKey(sortByOrder(projectRolesResult.data ?? []), 'project_id');
    const projectTechStack = groupByKey(sortByOrder(projectTechStackResult.data ?? []), 'project_id');
    const devToolTags = groupByKey(sortByOrder(devToolTagsResult.data ?? []), 'dev_tool_id');
    const productItemTags = groupByKey(sortByOrder(productItemTagsResult.data ?? []), 'product_item_id');

    const profileAndBasic = mapProfileAndBasic(profile, tags);
    const life = mapLife(lifeResult.data, listItems);
    const experience = mapExperience(experiencesResult.data ?? []);
    const education = mapEducation(schoolsResult.data ?? [], educationMetaResult.data);
    const work = mapWork(jobsResult.data ?? [], workMetaResult.data, listItems);
    const development = mapDevelopment(
      developmentSkillsResult.data ?? [],
      projects,
      projectTechStack,
      projectRoles,
      devToolsResult.data ?? [],
      devToolTags
    );
    const products = mapProducts(productItems, productItemTags, hardwareItems);
    const creation = mapCreation(creationItems, listItems);
    const media = mapMedia(mediaItems);
    const events = mapEvents(performancesResult.data ?? []);
    const contact = mapContact(contactMethodsResult.data ?? [], platformAccountsResult.data ?? []);
    const thoughts = mapThoughts(listItems, thoughtQaResult.data ?? []);
    const notifications = mapNotifications(notificationsResult.data ?? []);

    return {
      ...profileAndBasic,
      life,
      experience,
      education,
      work,
      development,
      products,
      creation,
      reading: media.reading,
      films: media.films,
      music: media.music,
      hiphop: media.hiphop,
      events,
      contact,
      thoughts,
      notifications,
    };
  } catch (error) {
    throw new Error(`Failed to load readme data from Supabase: ${(error as Error).message}`);
  }
}
