import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ReadmeData } from '@/types';
import {
  MutationScope,
  ensureString,
  ensureStringArray,
  getProfile,
  replaceProfileScopedRows,
  replaceRelatedRows,
} from './helpers';

export async function updateDevelopmentSection(
  data: ReadmeData['development'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

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
