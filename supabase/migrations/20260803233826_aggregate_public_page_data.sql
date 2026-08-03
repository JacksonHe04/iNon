create or replace function public.read_public_profile_page(
  target_identifier text,
  fallback_identifier text
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with direct_profile as (
    select profile.*, 'direct'::text as resolution
    from public.profiles profile
    where profile.is_published = true
      and case
        when target_identifier = '' then profile.slug = ''
        else profile.slug = target_identifier or profile.username = target_identifier
      end
    limit 1
  ),
  alias_profile as (
    select profile.*, 'alias'::text as resolution
    from public.profile_slugs alias
    join public.profiles profile on profile.id = alias.profile_id
    where target_identifier <> ''
      and alias.slug = target_identifier
      and profile.is_published = true
    limit 1
  ),
  default_profile as (
    select profile.*, 'default'::text as resolution
    from public.profiles profile
    where profile.is_published = true
      and (profile.slug = fallback_identifier or profile.username = fallback_identifier)
    limit 1
  ),
  empty_profile as (
    select profile.*, 'empty'::text as resolution
    from public.profiles profile
    where profile.is_published = true and profile.slug = ''
    limit 1
  ),
  resolved as (
    select * from direct_profile
    union all
    select * from alias_profile where not exists (select 1 from direct_profile)
    union all
    select * from default_profile
      where not exists (select 1 from direct_profile)
        and not exists (select 1 from alias_profile)
    union all
    select * from empty_profile
      where not exists (select 1 from direct_profile)
        and not exists (select 1 from alias_profile)
        and not exists (select 1 from default_profile)
    limit 1
  )
  select jsonb_build_object(
    'profile', jsonb_build_object(
      'id', profile.id,
      'slug', profile.slug,
      'username', profile.username,
      'name', profile.name,
      'intro', profile.intro,
      'current_status', profile.current_status,
      'meta_title', profile.meta_title,
      'meta_description', profile.meta_description,
      'meta_author', profile.meta_author
    ),
    'layoutConfig', profile.layout_config,
    'resolution', profile.resolution,
    'source', public.read_public_profile_source(profile.id)
  )
  from resolved profile;
$$;

revoke execute on function public.read_public_profile_page(text, text) from public, anon, authenticated;
grant execute on function public.read_public_profile_page(text, text) to service_role;
