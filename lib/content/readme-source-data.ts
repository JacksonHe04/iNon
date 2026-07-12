import { listVisibleMessages } from './messages';
import { groupByKey, sortByOrder } from './mappers';
import { listByForeignIds, listTable, maybeSingleByProfile } from './db-helpers';
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
  LibraryItemRow,
  LibraryCategoryRow,
  PerformanceRow,
  ContactMethodRow,
  PlatformAccountRow,
  ThoughtQaRow,
  NotificationRow,
  ProjectListRow,
  DevToolTagRow,
  ProductItemTagRow,
} from '@/types/database';

type TagRow = ValueRow & { tag_type: string };
type ListRow = ValueRow & { list_type: string };

export interface ReadmeSourceData {
  life: ProfileLifeRow | null;
  tags: TagRow[];
  listItems: ListRow[];
  experiences: ExperienceRow[];
  schools: SchoolRow[];
  educationMeta: EducationMetaRow | null;
  workMeta: WorkMetaRow | null;
  jobs: JobRow[];
  developmentSkills: DevelopmentSkillRow[];
  projects: ProjectRow[];
  devTools: DevToolRow[];
  productItems: ProductItemRow[];
  hardwareItems: HardwareItemRow[];
  creationItems: CreationItemRow[];
  libraryItems: LibraryItemRow[];
  libraryCategories: LibraryCategoryRow[];
  performances: PerformanceRow[];
  contactMethods: ContactMethodRow[];
  platformAccounts: PlatformAccountRow[];
  thoughtQa: ThoughtQaRow[];
  notifications: NotificationRow[];
  projectRoles: Map<string, ProjectListRow[]>;
  projectTechStack: Map<string, ProjectListRow[]>;
  devToolTags: Map<string, DevToolTagRow[]>;
  productItemTags: Map<string, ProductItemTagRow[]>;
  messages: Awaited<ReturnType<typeof listVisibleMessages>>;
}

function firstError(results: Array<{ error: Error | null }>): Error | null {
  return results.find((result) => result.error)?.error ?? null;
}

export async function loadReadmeSourceData(profileId: string): Promise<ReadmeSourceData> {
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
    libraryItemsResult,
    libraryCategoriesResult,
    performancesResult,
    contactMethodsResult,
    platformAccountsResult,
    thoughtQaResult,
    notificationsResult,
  ] = await Promise.all([
    maybeSingleByProfile<ProfileLifeRow>('profile_life', profileId),
    listTable<TagRow>('profile_tags', profileId),
    listTable<ListRow>('profile_list_items', profileId),
    listTable<ExperienceRow>('experiences', profileId),
    listTable<SchoolRow>('schools', profileId),
    maybeSingleByProfile<EducationMetaRow>('education_meta', profileId),
    maybeSingleByProfile<WorkMetaRow>('work_meta', profileId),
    listTable<JobRow>('jobs', profileId),
    listTable<DevelopmentSkillRow>('development_skills', profileId),
    listTable<ProjectRow>('projects', profileId),
    listTable<DevToolRow>('dev_tools', profileId),
    listTable<ProductItemRow>('product_items', profileId),
    listTable<HardwareItemRow>('hardware_items', profileId),
    listTable<CreationItemRow>('creation_items', profileId),
    listTable<LibraryItemRow>('library_items', profileId),
    listTable<LibraryCategoryRow>('library_categories', profileId),
    listTable<PerformanceRow>('performances', profileId),
    listTable<ContactMethodRow>('contact_methods', profileId),
    listTable<PlatformAccountRow>('platform_accounts', profileId),
    listTable<ThoughtQaRow>('thought_qa', profileId),
    listTable<NotificationRow>('notifications', profileId),
  ]);

  const baseError = firstError([
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
    libraryItemsResult,
    libraryCategoriesResult,
    performancesResult,
    contactMethodsResult,
    platformAccountsResult,
    thoughtQaResult,
    notificationsResult,
  ]);

  if (baseError) {
    throw baseError;
  }

  const projects = sortByOrder(projectsResult.data ?? []);
  const devTools = sortByOrder(devToolsResult.data ?? []);
  const productItems = sortByOrder(productItemsResult.data ?? []);
  const hardwareItems = sortByOrder(hardwareItemsResult.data ?? []);
  const creationItems = sortByOrder(creationItemsResult.data ?? []);
  const projectIds = projects.map((project) => project.id);
  const devToolIds = devTools.map((tool) => tool.id);
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

  const relationError = firstError([
    projectRolesResult,
    projectTechStackResult,
    devToolTagsResult,
    productItemTagsResult,
  ]);

  if (relationError) {
    throw relationError;
  }

  return {
    life: lifeResult.data,
    tags: tagsResult.data ?? [],
    listItems: listItemsResult.data ?? [],
    experiences: experiencesResult.data ?? [],
    schools: schoolsResult.data ?? [],
    educationMeta: educationMetaResult.data,
    workMeta: workMetaResult.data,
    jobs: jobsResult.data ?? [],
    developmentSkills: developmentSkillsResult.data ?? [],
    projects,
    devTools,
    productItems,
    hardwareItems,
    creationItems,
    libraryItems: libraryItemsResult.data ?? [],
    libraryCategories: libraryCategoriesResult.data ?? [],
    performances: performancesResult.data ?? [],
    contactMethods: contactMethodsResult.data ?? [],
    platformAccounts: platformAccountsResult.data ?? [],
    thoughtQa: thoughtQaResult.data ?? [],
    notifications: notificationsResult.data ?? [],
    projectRoles: groupByKey(sortByOrder(projectRolesResult.data ?? []), 'project_id'),
    projectTechStack: groupByKey(sortByOrder(projectTechStackResult.data ?? []), 'project_id'),
    devToolTags: groupByKey(sortByOrder(devToolTagsResult.data ?? []), 'dev_tool_id'),
    productItemTags: groupByKey(sortByOrder(productItemTagsResult.data ?? []), 'product_item_id'),
    messages: await listVisibleMessages(profileId),
  };
}
