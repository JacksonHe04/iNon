import { createClient } from '@/lib/supabase/server';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { ReadmeData } from '@/types';

type QueryResult<T> = {
  data: T[] | null;
  error: Error | null;
};

type MaybeSingleResult<T> = {
  data: T | null;
  error: Error | null;
};

type ProfileRow = {
  id: string;
  slug: string;
  name: string;
  intro: string;
  current_status: string;
  meta_title: string;
  meta_description: string;
  meta_author: string;
};

type ProfileLifeRow = {
  current_city: string;
  birth_date: string;
  zodiac_sign: string;
  life_mbti: string;
  work_mbti: string;
};

type ValueRow = {
  value: string;
  sort_order: number;
};

type ExperienceRow = {
  city: string;
  event_date: string;
  description: string;
  sort_order: number;
};

type SchoolRow = {
  degree: string;
  major: string;
  institution: string;
  start_date: string;
  end_date: string;
  sort_order: number;
};

type EducationMetaRow = {
  undergraduate_major: string;
  undergraduate_advisor: string;
};

type WorkMetaRow = {
  current_job: string;
};

type JobRow = {
  id: string;
  company_name: string;
  position: string;
  position_type: string;
  start_date: string;
  end_date: string;
  products_responsible_for: string;
  job_summary: string;
  work_output: string;
  sort_order: number;
};

type DevelopmentSkillRow = {
  skill_type: 'tech_stack' | 'expertise';
  value: string;
  sort_order: number;
};

type ProjectRow = {
  id: string;
  project_name: string;
  github_url: string;
  live_url: string;
  description: string;
  start_date: string;
  end_date: string;
  report_url: string;
  sort_order: number;
};

type ProjectListRow = {
  project_id: string;
  value: string;
  sort_order: number;
};

type DevToolRow = {
  id: string;
  name: string;
  link: string;
  comment: string;
  sort_order: number;
};

type DevToolTagRow = {
  dev_tool_id: string;
  value: string;
  sort_order: number;
};

type ProductItemRow = {
  id: string;
  item_type: 'favorite_product' | 'recommended_product' | 'favorite_brand';
  name: string;
  link: string;
  intro: string;
  sort_order: number;
};

type ProductItemTagRow = {
  product_item_id: string;
  value: string;
  sort_order: number;
};

type HardwareItemRow = {
  category: 'phone' | 'computer' | 'tablet' | 'smartwatch' | 'headphones';
  value: string;
  sort_order: number;
};

type CreationItemRow = {
  item_type: 'video' | 'article' | 'speech';
  series: string;
  title: string;
  link_primary: string;
  link_secondary: string;
  excerpt: string;
  outline_doc: string;
  sort_order: number;
};

type MediaItemRow = {
  domain: 'reading' | 'films' | 'music' | 'hiphop';
  item_type: string;
  name: string;
  creator: string;
  album: string;
  country_or_region: string;
  link: string;
  comment: string;
  sort_order: number;
};

type PerformanceRow = {
  event_type: string;
  name: string;
  event_date: string;
  genre: string;
  location: string;
  sort_order: number;
};

type ContactMethodRow = {
  method_name: string;
  content: string;
  sort_order: number;
};

type PlatformAccountRow = {
  platform_name: string;
  username: string;
  homepage_link: string;
  sort_order: number;
};

type ThoughtQaRow = {
  question: string;
  answer: string;
  source: string;
  qa_date: string;
  sort_order: number;
};

type NotificationRow = {
  notification_date: string;
  text: string;
  type: string;
  sort_order: number;
};

function sortByOrder<T extends { sort_order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

function valuesByType(rows: ValueRow[], type: string): string[] {
  return sortByOrder(rows.filter((row) => (row as ValueRow & { tag_type?: string; list_type?: string }).tag_type === type || (row as ValueRow & { list_type?: string }).list_type === type)).map((row) => row.value);
}

function groupByKey<T extends Record<string, string | number>>(rows: T[], key: keyof T): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const bucketKey = String(row[key]);
    const list = map.get(bucketKey) ?? [];
    list.push(row);
    map.set(bucketKey, list);
  }
  return map;
}

function withFallback(value: string | null | undefined): string {
  return value ?? '';
}

async function listTable<T>(table: string, profileId: string, select = '*'): Promise<QueryResult<T>> {
  const supabase = await createClient();
  const response = await supabase
    .from(table)
    .select(select)
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: true });

  return {
    data: (response.data as T[] | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

async function maybeSingleByProfile<T>(table: string, profileId: string, select = '*'): Promise<MaybeSingleResult<T>> {
  const supabase = await createClient();
  const response = await supabase
    .from(table)
    .select(select)
    .eq('profile_id', profileId)
    .maybeSingle();

  return {
    data: (response.data as T | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

async function listByForeignIds<T>(
  table: string,
  key: string,
  ids: string[],
  select = '*'
): Promise<QueryResult<T>> {
  if (!ids.length) {
    return { data: [], error: null };
  }

  const supabase = await createClient();
  const response = await supabase
    .from(table)
    .select(select)
    .in(key, ids)
    .order('sort_order', { ascending: true });

  return {
    data: (response.data as T[] | null) ?? null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

async function loadProfile(identifier: string): Promise<MaybeSingleResult<ProfileRow>> {
  const supabase = await createClient();

  // 1. Check profiles by slug or username
  let query = supabase
    .from('profiles')
    .select('id, slug, username, name, intro, current_status, meta_title, meta_description, meta_author')
    .eq('is_published', true);

  if (identifier) {
    query = query.or(`slug.eq.${identifier},username.eq.${identifier}`);
  } else {
    // If identifier is empty string (root / or /i), try searching slug = '' or fallback
    query = query.eq('slug', '');
  }

  const response = await query.maybeSingle();
  if (response.data) {
    return {
      data: response.data as ProfileRow,
      error: null,
    };
  }

  // 2. Check profile_slugs table for alias slugs
  try {
    const slugRes = await supabase
      .from('profile_slugs')
      .select('profile_id')
      .eq('slug', identifier ?? '')
      .maybeSingle();

    if (slugRes.data?.profile_id) {
      const profRes = await supabase
        .from('profiles')
        .select('id, slug, username, name, intro, current_status, meta_title, meta_description, meta_author')
        .eq('id', slugRes.data.profile_id)
        .eq('is_published', true)
        .maybeSingle();

      if (profRes.data) {
        return {
          data: profRes.data as ProfileRow,
          error: null,
        };
      }
    }
  } catch (_e) {
    // profile_slugs table might not exist yet
  }

  return {
    data: null,
    error: response.error ? new Error(response.error.message) : null,
  };
}

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

    const mediaBy = (domain: MediaItemRow['domain'], itemType: string) =>
      mediaItems.filter((item) => item.domain === domain && item.item_type === itemType);

    const hardwareValue = (category: HardwareItemRow['category']) =>
      hardwareItems.filter((item) => item.category === category).map((item) => item.value);

    return {
      meta: {
        title: profile.meta_title,
        description: profile.meta_description,
        author: profile.meta_author,
      },
      basic: {
        name: profile.name,
        intro: profile.intro,
        current_status: profile.current_status,
        keywords: valuesByType(tags, 'keyword'),
        values: valuesByType(tags, 'value'),
        tags: valuesByType(tags, 'tag'),
      },
      life: {
        current_city: withFallback(lifeResult.data?.current_city),
        mbti: {
          life_mbti: withFallback(lifeResult.data?.life_mbti),
          work_mbti: withFallback(lifeResult.data?.work_mbti),
        },
        birth_date: withFallback(lifeResult.data?.birth_date),
        zodiac_sign: withFallback(lifeResult.data?.zodiac_sign),
        habits: valuesByType(listItems, 'habit'),
        diet: {
          favorite_food: valuesByType(listItems, 'favorite_food'),
          favorite_drinks: valuesByType(listItems, 'favorite_drink'),
        },
      },
      experience: {
        experience: sortByOrder(experiencesResult.data ?? []).map((item) => ({
          city: item.city,
          date: item.event_date,
          description: item.description,
        })),
      },
      education: {
        schools: sortByOrder(schoolsResult.data ?? []).map((item) => ({
          degree: item.degree,
          major: item.major,
          institution: item.institution,
          start_date: item.start_date,
          end_date: item.end_date,
        })),
        undergraduate_major: withFallback(educationMetaResult.data?.undergraduate_major),
        undergraduate_advisor: withFallback(educationMetaResult.data?.undergraduate_advisor),
      },
      work: {
        current_job: withFallback(workMetaResult.data?.current_job),
        jobs: sortByOrder(jobsResult.data ?? []).map((item) => ({
          company_name: item.company_name,
          position: item.position,
          position_type: item.position_type,
          start_date: item.start_date,
          end_date: item.end_date,
          products_responsible_for: item.products_responsible_for,
          job_summary: item.job_summary,
          work_output: item.work_output,
        })),
        work_preferences: valuesByType(listItems, 'work_preference'),
      },
      development: {
        skills: {
          tech_stack: sortByOrder((developmentSkillsResult.data ?? []).filter((item) => item.skill_type === 'tech_stack')).map((item) => item.value),
          expertise: sortByOrder((developmentSkillsResult.data ?? []).filter((item) => item.skill_type === 'expertise')).map((item) => item.value),
        },
        projects: projects.map((project) => ({
          project_name: project.project_name,
          github: project.github_url,
          link: project.live_url,
          description: project.description,
          tech_stack: sortByOrder(projectTechStack.get(project.id) ?? []).map((item) => item.value),
          role: sortByOrder(projectRoles.get(project.id) ?? []).map((item) => item.value),
          start_date: project.start_date,
          end_date: project.end_date,
          report_link: project.report_url,
        })),
        dev_tools: sortByOrder(devToolsResult.data ?? []).map((tool) => ({
          name: tool.name,
          link: tool.link,
          comment: tool.comment,
          tags: sortByOrder(devToolTags.get(tool.id) ?? []).map((item) => item.value),
        })),
      },
      products: {
        favorite_products: productItems
          .filter((item) => item.item_type === 'favorite_product')
          .map((item) => ({
            name: item.name,
            link: item.link,
            intro: item.intro,
            tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
          })),
        recommended_products: productItems
          .filter((item) => item.item_type === 'recommended_product')
          .map((item) => ({
            name: item.name,
            link: item.link,
            intro: item.intro,
            tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
          })),
        my_hardware: {
          phone: hardwareValue('phone')[0] ?? '',
          computer: hardwareValue('computer')[0] ?? '',
          tablet: hardwareValue('tablet')[0] ?? '',
          smartwatch: hardwareValue('smartwatch')[0] ?? '',
          headphones: hardwareValue('headphones'),
        },
        favorite_brands: productItems
          .filter((item) => item.item_type === 'favorite_brand')
          .map((item) => ({
            name: item.name,
            link: item.link,
            intro: item.intro,
            tags: sortByOrder(productItemTags.get(item.id) ?? []).map((tag) => tag.value),
          })),
      },
      creation: {
        videos: creationItems
          .filter((item) => item.item_type === 'video')
          .map((item) => ({
            series: item.series,
            title: item.title,
            video_link: item.link_primary,
            podcast_link: item.link_secondary,
          })),
        articles: creationItems
          .filter((item) => item.item_type === 'article')
          .map((item) => ({
            title: item.title,
            link: item.link_primary,
            excerpt: item.excerpt,
          })),
        speeches: creationItems
          .filter((item) => item.item_type === 'speech')
          .map((item) => ({
            speech_name: item.title,
            link: item.link_primary,
            outline_doc: item.outline_doc,
            presentation_link: item.link_secondary,
          })),
        mottos: valuesByType(listItems, 'motto'),
        quotes: valuesByType(listItems, 'quote'),
      },
      reading: {
        books: mediaBy('reading', 'book').map((item) => ({
          name: item.name,
          author: item.creator,
          country: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
        authors: mediaBy('reading', 'author').map((item) => ({
          name: item.name,
          country: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
      },
      films: {
        films: mediaBy('films', 'film').map((item) => ({
          name: item.name,
          director: item.creator,
          country: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
        directors: mediaBy('films', 'director').map((item) => ({
          name: item.name,
          country: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
      },
      music: {
        albums: mediaBy('music', 'album').map((item) => ({
          name: item.name,
          artist: item.creator,
          link: item.link,
          comment: item.comment,
        })),
        songs: mediaBy('music', 'song').map((item) => ({
          name: item.name,
          artist: item.creator,
          album: item.album,
          link: item.link,
          comment: item.comment,
        })),
        musicians: mediaBy('music', 'musician').map((item) => ({
          name: item.name,
          region: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
      },
      hiphop: {
        albums: mediaBy('hiphop', 'album').map((item) => ({
          name: item.name,
          artist: item.creator,
          link: item.link,
          comment: item.comment,
        })),
        songs: mediaBy('hiphop', 'song').map((item) => ({
          name: item.name,
          artist: item.creator,
          album: item.album,
          link: item.link,
          comment: item.comment,
        })),
        musicians: mediaBy('hiphop', 'musician').map((item) => ({
          name: item.name,
          region: item.country_or_region,
          link: item.link,
          comment: item.comment,
        })),
      },
      events: {
        performances: sortByOrder(performancesResult.data ?? []).map((item) => ({
          type: item.event_type,
          name: item.name,
          date: item.event_date,
          genre: item.genre,
          location: item.location,
        })),
      },
      contact: {
        contact_info: sortByOrder(contactMethodsResult.data ?? []).map((item) => ({
          method_name: item.method_name,
          content: item.content,
        })),
        platform_accounts: sortByOrder(platformAccountsResult.data ?? []).map((item) => ({
          platform_name: item.platform_name,
          username: item.username,
          homepage_link: item.homepage_link,
        })),
      },
      thoughts: {
        personal_philosophy: valuesByType(listItems, 'personal_philosophy'),
        industry_views: valuesByType(listItems, 'industry_view'),
        ideology: valuesByType(listItems, 'ideology'),
        life_elements: valuesByType(listItems, 'life_element'),
        macro_vision: valuesByType(listItems, 'macro_vision'),
        personal_vision: valuesByType(listItems, 'personal_vision'),
        qa: sortByOrder(thoughtQaResult.data ?? []).map((item) => ({
          question: item.question,
          answer: item.answer,
          source: item.source,
          date: item.qa_date,
        })),
      },
      notifications: (notificationsResult.data ?? [])
        .slice()
        .sort((a, b) => (b.notification_date ?? '').localeCompare(a.notification_date ?? ''))
        .map((item) => ({
          date: item.notification_date,
          text: item.text,
          type: item.type,
        })),
    };
  } catch (error) {
    throw new Error(`Failed to load readme data from Supabase: ${(error as Error).message}`);
  }
}
