import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import type { ReadmeData } from '@/types';

type SupabaseAdminClient = ReturnType<typeof createAdminClient>;

function ensureString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function ensureStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => ensureString(item)).filter(Boolean) : [];
}

async function getProfile(adminClient: SupabaseAdminClient) {
  const { getAdminContext } = await import('@/lib/admin/auth');
  const context = await getAdminContext();

  if (context?.user?.id) {
    const { data: userProfile } = await adminClient
      .from('profiles')
      .select('id, slug, username')
      .eq('user_id', context.user.id)
      .maybeSingle();

    if (userProfile) {
      return userProfile;
    }
  }

  const { data, error } = await adminClient
    .from('profiles')
    .select('id, slug, username')
    .eq('slug', DEFAULT_PROFILE_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Profile "${DEFAULT_PROFILE_SLUG}" not found`);
  return data;
}

async function replaceProfileScopedRows(
  adminClient: SupabaseAdminClient,
  table: string,
  profileId: string,
  rows: Record<string, unknown>[]
) {
  const { error: deleteError } = await adminClient
    .from(table)
    .delete()
    .eq('profile_id', profileId);
  if (deleteError) throw deleteError;

  if (!rows.length) return [];

  const { data, error } = await adminClient.from(table).insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

async function replaceRelatedRows(
  adminClient: SupabaseAdminClient,
  table: string,
  key: string,
  ids: string[],
  rows: Record<string, unknown>[]
) {
  if (ids.length > 0) {
    const { error: deleteError } = await adminClient.from(table).delete().in(key, ids);
    if (deleteError) throw deleteError;
  }

  if (!rows.length) return [];

  const { data, error } = await adminClient.from(table).insert(rows).select();
  if (error) throw error;
  return data ?? [];
}

function stringRows(profileId: string, listType: string, values: string[]) {
  return values.map((value, index) => ({
    profile_id: profileId,
    list_type: listType,
    value,
    sort_order: index,
  }));
}

function tagRows(profileId: string, tagType: string, values: string[]) {
  return values.map((value, index) => ({
    profile_id: profileId,
    tag_type: tagType,
    value,
    sort_order: index,
  }));
}

export async function updateProfileSection(data: Pick<ReadmeData, 'meta' | 'basic'>) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      name: ensureString(data.basic.name),
      intro: ensureString(data.basic.intro),
      current_status: ensureString(data.basic.current_status),
      meta_title: ensureString(data.meta.title),
      meta_description: ensureString(data.meta.description),
      meta_author: ensureString(data.meta.author),
    })
    .eq('id', profile.id);
  if (profileError) throw profileError;

  await replaceProfileScopedRows(adminClient, 'profile_tags', profile.id, [
    ...tagRows(profile.id, 'keyword', ensureStringArray(data.basic.keywords)),
    ...tagRows(profile.id, 'value', ensureStringArray(data.basic.values)),
    ...tagRows(profile.id, 'tag', ensureStringArray(data.basic.tags)),
  ]);

  revalidatePath('/');
  revalidatePath('/i');
  revalidatePath('/admin/content');
  if (profile.username) {
    revalidatePath(`/${profile.username}`);
    revalidatePath(`/i/${profile.username}`);
  }
  if (profile.slug) {
    revalidatePath(`/${profile.slug}`);
    revalidatePath(`/i/${profile.slug}`);
  }
}

export async function updateLifeSection(data: ReadmeData['life']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  const { error: lifeError } = await adminClient.from('profile_life').upsert({
    profile_id: profile.id,
    current_city: ensureString(data.current_city),
    birth_date: ensureString(data.birth_date),
    zodiac_sign: ensureString(data.zodiac_sign),
    life_mbti: ensureString(data.mbti?.life_mbti),
    work_mbti: ensureString(data.mbti?.work_mbti),
  });
  if (lifeError) throw lifeError;

  const keepTypes = [
    'habit',
    'favorite_food',
    'favorite_drink',
  ];
  const { error: deleteError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', keepTypes);
  if (deleteError) throw deleteError;

  const rows = [
    ...stringRows(profile.id, 'habit', ensureStringArray(data.habits)),
    ...stringRows(profile.id, 'favorite_food', ensureStringArray(data.diet.favorite_food)),
    ...stringRows(profile.id, 'favorite_drink', ensureStringArray(data.diet.favorite_drinks)),
  ];
  if (rows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(rows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateExperienceSection(data: ReadmeData['experience']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(
    adminClient,
    'experiences',
    profile.id,
    data.experience.map((item, index) => ({
      profile_id: profile.id,
      city: ensureString(item.city),
      event_date: ensureString(item.date),
      description: ensureString(item.description),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateEducationSection(data: ReadmeData['education']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(
    adminClient,
    'schools',
    profile.id,
    data.schools.map((item, index) => ({
      profile_id: profile.id,
      degree: ensureString(item.degree),
      major: ensureString(item.major),
      institution: ensureString(item.institution),
      start_date: ensureString(item.start_date),
      end_date: ensureString(item.end_date),
      sort_order: index,
    }))
  );

  const { error } = await adminClient.from('education_meta').upsert({
    profile_id: profile.id,
    undergraduate_major: ensureString(data.undergraduate_major),
    undergraduate_advisor: ensureString(data.undergraduate_advisor),
  });
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateWorkSection(data: ReadmeData['work']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  const { error: workMetaError } = await adminClient.from('work_meta').upsert({
    profile_id: profile.id,
    current_job: ensureString(data.current_job),
  });
  if (workMetaError) throw workMetaError;

  await replaceProfileScopedRows(
    adminClient,
    'jobs',
    profile.id,
    data.jobs.map((item, index) => ({
      profile_id: profile.id,
      company_name: ensureString(item.company_name),
      position: ensureString(item.position),
      position_type: ensureString(item.position_type),
      start_date: ensureString(item.start_date),
      end_date: ensureString(item.end_date),
      products_responsible_for: ensureString(item.products_responsible_for),
      job_summary: ensureString(item.job_summary),
      work_output: ensureString(item.work_output),
      sort_order: index,
    }))
  );

  const { error: deletePrefsError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .eq('list_type', 'work_preference');
  if (deletePrefsError) throw deletePrefsError;

  const prefRows = stringRows(
    profile.id,
    'work_preference',
    ensureStringArray(data.work_preferences)
  );
  if (prefRows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(prefRows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateDevelopmentSection(data: ReadmeData['development']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(adminClient, 'development_skills', profile.id, [
    ...ensureStringArray(data.skills.tech_stack).map((value, index) => ({
      profile_id: profile.id,
      skill_type: 'tech_stack',
      value,
      sort_order: index,
    })),
    ...ensureStringArray(data.skills.expertise).map((value, index) => ({
      profile_id: profile.id,
      skill_type: 'expertise',
      value,
      sort_order: index,
    })),
  ]);

  const existingProjects = await adminClient
    .from('projects')
    .select('id')
    .eq('profile_id', profile.id);
  if (existingProjects.error) throw existingProjects.error;
  const projectIds = (existingProjects.data ?? []).map((item) => item.id);
  await replaceRelatedRows(adminClient, 'project_roles', 'project_id', projectIds, []);
  await replaceRelatedRows(adminClient, 'project_tech_stack', 'project_id', projectIds, []);

  const projectRows = await replaceProfileScopedRows(
    adminClient,
    'projects',
    profile.id,
    data.projects.map((item, index) => ({
      profile_id: profile.id,
      project_name: ensureString(item.project_name),
      github_url: ensureString(item.github),
      live_url: ensureString(item.link),
      description: ensureString(item.description),
      start_date: ensureString(item.start_date),
      end_date: ensureString(item.end_date),
      report_url: ensureString(item.report_link),
      sort_order: index,
    }))
  );

  const roleRows = projectRows.flatMap((projectRow, index) =>
    ensureStringArray(data.projects[index]?.role).map((value, roleIndex) => ({
      project_id: projectRow.id,
      value,
      sort_order: roleIndex,
    }))
  );
  const techRows = projectRows.flatMap((projectRow, index) =>
    ensureStringArray(data.projects[index]?.tech_stack).map((value, techIndex) => ({
      project_id: projectRow.id,
      value,
      sort_order: techIndex,
    }))
  );
  if (roleRows.length) {
    const { error } = await adminClient.from('project_roles').insert(roleRows);
    if (error) throw error;
  }
  if (techRows.length) {
    const { error } = await adminClient.from('project_tech_stack').insert(techRows);
    if (error) throw error;
  }

  const existingDevTools = await adminClient
    .from('dev_tools')
    .select('id')
    .eq('profile_id', profile.id);
  if (existingDevTools.error) throw existingDevTools.error;
  const devToolIds = (existingDevTools.data ?? []).map((item) => item.id);
  await replaceRelatedRows(adminClient, 'dev_tool_tags', 'dev_tool_id', devToolIds, []);

  const devToolRows = await replaceProfileScopedRows(
    adminClient,
    'dev_tools',
    profile.id,
    data.dev_tools.map((item, index) => ({
      profile_id: profile.id,
      name: ensureString(item.name),
      link: ensureString(item.link),
      comment: ensureString(item.comment),
      sort_order: index,
    }))
  );

  const toolTagRows = devToolRows.flatMap((toolRow, index) =>
    ensureStringArray(data.dev_tools[index]?.tags).map((value, tagIndex) => ({
      dev_tool_id: toolRow.id,
      value,
      sort_order: tagIndex,
    }))
  );
  if (toolTagRows.length) {
    const { error } = await adminClient.from('dev_tool_tags').insert(toolTagRows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateProductsSection(data: ReadmeData['products']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  const existingItems = await adminClient
    .from('product_items')
    .select('id')
    .eq('profile_id', profile.id);
  if (existingItems.error) throw existingItems.error;
  const productItemIds = (existingItems.data ?? []).map((item) => item.id);
  await replaceRelatedRows(adminClient, 'product_item_tags', 'product_item_id', productItemIds, []);

  const productRows = await replaceProfileScopedRows(adminClient, 'product_items', profile.id, [
    ...data.favorite_products.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'favorite_product',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      sort_order: index,
    })),
    ...data.recommended_products.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'recommended_product',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      sort_order: index,
    })),
    ...data.favorite_brands.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'favorite_brand',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      sort_order: index,
    })),
  ]);

  const sourceItems = [
    ...data.favorite_products,
    ...data.recommended_products,
    ...data.favorite_brands,
  ];
  const tagRows = productRows.flatMap((productRow, index) =>
    ensureStringArray(sourceItems[index]?.tags).map((value, tagIndex) => ({
      product_item_id: productRow.id,
      value,
      sort_order: tagIndex,
    }))
  );
  if (tagRows.length) {
    const { error } = await adminClient.from('product_item_tags').insert(tagRows);
    if (error) throw error;
  }

  await replaceProfileScopedRows(adminClient, 'hardware_items', profile.id, [
    {
      profile_id: profile.id,
      category: 'phone',
      value: ensureString(data.my_hardware.phone),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'computer',
      value: ensureString(data.my_hardware.computer),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'tablet',
      value: ensureString(data.my_hardware.tablet),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'smartwatch',
      value: ensureString(data.my_hardware.smartwatch),
      sort_order: 0,
    },
    ...ensureStringArray(data.my_hardware.headphones).map((value, index) => ({
      profile_id: profile.id,
      category: 'headphones',
      value,
      sort_order: index,
    })),
  ]);

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateCreationSection(data: ReadmeData['creation']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(adminClient, 'creation_items', profile.id, [
    ...data.videos.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'video',
      series: ensureString(item.series),
      title: ensureString(item.title),
      link_primary: ensureString(item.video_link),
      link_secondary: ensureString(item.podcast_link),
      excerpt: '',
      outline_doc: '',
      sort_order: index,
    })),
    ...data.articles.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'article',
      series: '',
      title: ensureString(item.title),
      link_primary: ensureString(item.link),
      link_secondary: '',
      excerpt: ensureString(item.excerpt),
      outline_doc: '',
      sort_order: index,
    })),
    ...data.speeches.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'speech',
      series: '',
      title: ensureString(item.speech_name),
      link_primary: ensureString(item.link),
      link_secondary: ensureString(item.presentation_link),
      excerpt: '',
      outline_doc: ensureString(item.outline_doc),
      sort_order: index,
    })),
  ]);

  const { error: deleteError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', ['motto', 'quote']);
  if (deleteError) throw deleteError;

  const listRows = [
    ...stringRows(profile.id, 'motto', ensureStringArray(data.mottos)),
    ...stringRows(profile.id, 'quote', ensureStringArray(data.quotes)),
  ];
  if (listRows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(listRows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
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

export async function updateReadingSection(data: ReadmeData['reading']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceMediaDomain(adminClient, profile.id, 'reading', [
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
      sort_order: data.books.length + index,
    })),
  ]);

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateFilmsSection(data: ReadmeData['films']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceMediaDomain(adminClient, profile.id, 'films', [
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
      sort_order: data.films.length + index,
    })),
  ]);

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateMusicSection(
  section: 'music' | 'hiphop',
  data: ReadmeData['music'] | ReadmeData['hiphop']
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceMediaDomain(adminClient, profile.id, section, [
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
      sort_order: data.albums.length + data.songs.length + index,
    })),
  ]);

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateEventsSection(data: ReadmeData['events']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

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

export async function updateContactSection(data: ReadmeData['contact']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(
    adminClient,
    'contact_methods',
    profile.id,
    data.contact_info.map((item, index) => ({
      profile_id: profile.id,
      method_name: ensureString(item.method_name),
      content: ensureString(item.content),
      sort_order: index,
    }))
  );

  await replaceProfileScopedRows(
    adminClient,
    'platform_accounts',
    profile.id,
    data.platform_accounts.map((item, index) => ({
      profile_id: profile.id,
      platform_name: ensureString(item.platform_name),
      username: ensureString(item.username),
      homepage_link: ensureString(item.homepage_link),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateThoughtsSection(data: ReadmeData['thoughts']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  const { error: deleteListError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', [
      'personal_philosophy',
      'industry_view',
      'ideology',
      'life_element',
      'macro_vision',
      'personal_vision',
    ]);
  if (deleteListError) throw deleteListError;

  const rows = [
    ...stringRows(profile.id, 'personal_philosophy', ensureStringArray(data.personal_philosophy)),
    ...stringRows(profile.id, 'industry_view', ensureStringArray(data.industry_views)),
    ...stringRows(profile.id, 'ideology', ensureStringArray(data.ideology)),
    ...stringRows(profile.id, 'life_element', ensureStringArray(data.life_elements)),
    ...stringRows(profile.id, 'macro_vision', ensureStringArray(data.macro_vision)),
    ...stringRows(profile.id, 'personal_vision', ensureStringArray(data.personal_vision)),
  ];
  if (rows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(rows);
    if (error) throw error;
  }

  await replaceProfileScopedRows(
    adminClient,
    'thought_qa',
    profile.id,
    data.qa.map((item, index) => ({
      profile_id: profile.id,
      question: ensureString(item.question),
      answer: ensureString(item.answer),
      source: ensureString(item.source),
      qa_date: ensureString(item.date),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateNotificationsSection(data: ReadmeData['notifications']) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient);

  await replaceProfileScopedRows(
    adminClient,
    'notifications',
    profile.id,
    data.map((item, index) => ({
      profile_id: profile.id,
      notification_date: ensureString(item.date),
      text: ensureString(item.text),
      type: ensureString(item.type),
      sort_order: index,
    }))
  );

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateMessageStatus(messageId: string, status: 'approved' | 'rejected' | 'spam') {
  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from('messages')
    .update({
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    })
    .eq('id', messageId);
  if (error) throw error;

  revalidatePath('/');
  revalidatePath('/admin/messages');
}
