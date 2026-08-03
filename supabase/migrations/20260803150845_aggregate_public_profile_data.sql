create or replace function public.read_public_profile_source(target_profile_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'life', (select to_jsonb(row) from public.profile_life row where row.profile_id = target_profile_id),
    'tags', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.profile_tags row where row.profile_id = target_profile_id), '[]'::jsonb),
    'listItems', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.profile_list_items row where row.profile_id = target_profile_id), '[]'::jsonb),
    'experiences', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.experiences row where row.profile_id = target_profile_id), '[]'::jsonb),
    'schools', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.schools row where row.profile_id = target_profile_id), '[]'::jsonb),
    'educationMeta', (select to_jsonb(row) from public.education_meta row where row.profile_id = target_profile_id),
    'workMeta', (select to_jsonb(row) from public.work_meta row where row.profile_id = target_profile_id),
    'jobs', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.jobs row where row.profile_id = target_profile_id), '[]'::jsonb),
    'developmentSkills', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.development_skills row where row.profile_id = target_profile_id), '[]'::jsonb),
    'projects', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.projects row where row.profile_id = target_profile_id), '[]'::jsonb),
    'devTools', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.dev_tools row where row.profile_id = target_profile_id), '[]'::jsonb),
    'productItems', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.product_items row where row.profile_id = target_profile_id), '[]'::jsonb),
    'hardwareItems', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.hardware_items row where row.profile_id = target_profile_id), '[]'::jsonb),
    'creationItems', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.creation_items row where row.profile_id = target_profile_id), '[]'::jsonb),
    'libraryItems', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.library_items row where row.profile_id = target_profile_id), '[]'::jsonb),
    'libraryCategories', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.library_categories row where row.profile_id = target_profile_id), '[]'::jsonb),
    'performances', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.performances row where row.profile_id = target_profile_id), '[]'::jsonb),
    'contactMethods', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.contact_methods row where row.profile_id = target_profile_id), '[]'::jsonb),
    'platformAccounts', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.platform_accounts row where row.profile_id = target_profile_id), '[]'::jsonb),
    'thoughtQa', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.thought_qa row where row.profile_id = target_profile_id), '[]'::jsonb),
    'notifications', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.notifications row where row.profile_id = target_profile_id), '[]'::jsonb),
    'projectRoles', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.project_roles row where row.project_id in (select project.id from public.projects project where project.profile_id = target_profile_id)), '[]'::jsonb),
    'projectTechStack', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.project_tech_stack row where row.project_id in (select project.id from public.projects project where project.profile_id = target_profile_id)), '[]'::jsonb),
    'devToolTags', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.dev_tool_tags row where row.dev_tool_id in (select tool.id from public.dev_tools tool where tool.profile_id = target_profile_id)), '[]'::jsonb),
    'productItemTags', coalesce((select jsonb_agg(to_jsonb(row) order by row.sort_order) from public.product_item_tags row where row.product_item_id in (select item.id from public.product_items item where item.profile_id = target_profile_id)), '[]'::jsonb),
    'messages', coalesce((select jsonb_agg(jsonb_build_object('id', row.id, 'nickname', row.nickname, 'content', row.content, 'created_at', row.created_at) order by row.created_at desc) from public.messages row where row.profile_id = target_profile_id and row.status = 'approved'), '[]'::jsonb)
  );
$$;

revoke execute on function public.read_public_profile_source(uuid) from public, anon, authenticated;
grant execute on function public.read_public_profile_source(uuid) to service_role;
