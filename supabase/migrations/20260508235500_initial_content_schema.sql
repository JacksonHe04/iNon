create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles ( id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null, intro text not null default '', current_status text not null default '', meta_title text not null, meta_description text not null default '', meta_author text not null default '', is_published boolean not null default true, created_at timestamptz not null default timezone('utc', now()), updated_at timestamptz not null default timezone('utc', now()));

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create table if not exists public.profile_life ( profile_id uuid primary key references public.profiles(id) on delete cascade, current_city text not null default '', birth_date text not null default '', zodiac_sign text not null default '', life_mbti text not null default '', work_mbti text not null default '');

create table if not exists public.profile_tags ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, tag_type text not null check (tag_type in ('keyword', 'value', 'tag')), value text not null, sort_order integer not null default 0);

create index if not exists idx_profile_tags_profile_sort on public.profile_tags(profile_id, tag_type, sort_order);

create table if not exists public.profile_list_items ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, list_type text not null, value text not null, sort_order integer not null default 0);

create index if not exists idx_profile_list_items_profile_sort on public.profile_list_items(profile_id, list_type, sort_order);

create table if not exists public.experiences ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, city text not null default '', event_date text not null default '', description text not null default '', sort_order integer not null default 0);

create index if not exists idx_experiences_profile_sort on public.experiences(profile_id, sort_order);

create table if not exists public.schools ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, degree text not null default '', major text not null default '', institution text not null default '', start_date text not null default '', end_date text not null default '', sort_order integer not null default 0);

create index if not exists idx_schools_profile_sort on public.schools(profile_id, sort_order);

create table if not exists public.education_meta ( profile_id uuid primary key references public.profiles(id) on delete cascade, undergraduate_major text not null default '', undergraduate_advisor text not null default '');

create table if not exists public.work_meta ( profile_id uuid primary key references public.profiles(id) on delete cascade, current_job text not null default '');

create table if not exists public.jobs ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, company_name text not null default '', position text not null default '', position_type text not null default '', start_date text not null default '', end_date text not null default '', products_responsible_for text not null default '', job_summary text not null default '', work_output text not null default '', sort_order integer not null default 0);

create index if not exists idx_jobs_profile_sort on public.jobs(profile_id, sort_order);

create table if not exists public.development_skills ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, skill_type text not null check (skill_type in ('tech_stack', 'expertise')), value text not null, sort_order integer not null default 0);

create index if not exists idx_development_skills_profile_sort on public.development_skills(profile_id, skill_type, sort_order);

create table if not exists public.projects ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, project_name text not null, github_url text not null default '', live_url text not null default '', description text not null default '', start_date text not null default '', end_date text not null default '', report_url text not null default '', sort_order integer not null default 0);

create index if not exists idx_projects_profile_sort on public.projects(profile_id, sort_order);

create table if not exists public.project_roles ( id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, value text not null, sort_order integer not null default 0);

create index if not exists idx_project_roles_project_sort on public.project_roles(project_id, sort_order);

create table if not exists public.project_tech_stack ( id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade, value text not null, sort_order integer not null default 0);

create index if not exists idx_project_tech_stack_project_sort on public.project_tech_stack(project_id, sort_order);

create table if not exists public.dev_tools ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, name text not null, link text not null default '', comment text not null default '', sort_order integer not null default 0);

create index if not exists idx_dev_tools_profile_sort on public.dev_tools(profile_id, sort_order);

create table if not exists public.dev_tool_tags ( id uuid primary key default gen_random_uuid(), dev_tool_id uuid not null references public.dev_tools(id) on delete cascade, value text not null, sort_order integer not null default 0);

create index if not exists idx_dev_tool_tags_tool_sort on public.dev_tool_tags(dev_tool_id, sort_order);

create table if not exists public.product_items ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, item_type text not null check (item_type in ('favorite_product', 'recommended_product', 'favorite_brand')), name text not null, link text not null default '', intro text not null default '', sort_order integer not null default 0);

create index if not exists idx_product_items_profile_sort on public.product_items(profile_id, item_type, sort_order);

create table if not exists public.product_item_tags ( id uuid primary key default gen_random_uuid(), product_item_id uuid not null references public.product_items(id) on delete cascade, value text not null, sort_order integer not null default 0);

create index if not exists idx_product_item_tags_item_sort on public.product_item_tags(product_item_id, sort_order);

create table if not exists public.hardware_items ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, category text not null check (category in ('phone', 'computer', 'tablet', 'smartwatch', 'headphones')), value text not null, sort_order integer not null default 0);

create index if not exists idx_hardware_items_profile_sort on public.hardware_items(profile_id, category, sort_order);

create table if not exists public.creation_items ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, item_type text not null check (item_type in ('video', 'article', 'speech')), series text not null default '', title text not null, link_primary text not null default '', link_secondary text not null default '', excerpt text not null default '', outline_doc text not null default '', sort_order integer not null default 0);

create index if not exists idx_creation_items_profile_sort on public.creation_items(profile_id, item_type, sort_order);

create table if not exists public.media_items ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, domain text not null check (domain in ('reading', 'films', 'music', 'hiphop')), item_type text not null, name text not null, creator text not null default '', album text not null default '', country_or_region text not null default '', link text not null default '', comment text not null default '', sort_order integer not null default 0);

create index if not exists idx_media_items_profile_sort on public.media_items(profile_id, domain, item_type, sort_order);

create table if not exists public.performances ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, event_type text not null default '', name text not null, event_date text not null default '', genre text not null default '', location text not null default '', sort_order integer not null default 0);

create index if not exists idx_performances_profile_sort on public.performances(profile_id, sort_order);

create table if not exists public.contact_methods ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, method_name text not null, content text not null, sort_order integer not null default 0);

create index if not exists idx_contact_methods_profile_sort on public.contact_methods(profile_id, sort_order);

create table if not exists public.platform_accounts ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, platform_name text not null, username text not null default '', homepage_link text not null default '', sort_order integer not null default 0);

create index if not exists idx_platform_accounts_profile_sort on public.platform_accounts(profile_id, sort_order);

create table if not exists public.thought_qa ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, question text not null, answer text not null, source text not null default '', qa_date text not null default '', sort_order integer not null default 0);

create index if not exists idx_thought_qa_profile_sort on public.thought_qa(profile_id, sort_order);

create table if not exists public.notifications ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, notification_date text not null default '', text text not null, type text not null default '', sort_order integer not null default 0);

create index if not exists idx_notifications_profile_sort on public.notifications(profile_id, sort_order);

create table if not exists public.messages ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, nickname text not null default '', content text not null, contact text not null default '', status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'spam')), ip_hash text not null default '', user_agent text not null default '', created_at timestamptz not null default timezone('utc', now()), approved_at timestamptz, approved_by uuid);

create index if not exists idx_messages_profile_status_created on public.messages(profile_id, status, created_at desc);

create table if not exists public.media_assets ( id uuid primary key default gen_random_uuid(), profile_id uuid not null references public.profiles(id) on delete cascade, bucket text not null, object_path text not null, asset_type text not null default '', title text not null default '', alt_text text not null default '', mime_type text not null default '', width integer, height integer, linked_table text not null default '', linked_id uuid, sort_order integer not null default 0, created_at timestamptz not null default timezone('utc', now()));

create index if not exists idx_media_assets_profile_sort on public.media_assets(profile_id, asset_type, sort_order);

alter table public.profiles enable row level security;

alter table public.profile_life enable row level security;

alter table public.profile_tags enable row level security;

alter table public.profile_list_items enable row level security;

alter table public.experiences enable row level security;

alter table public.schools enable row level security;

alter table public.education_meta enable row level security;

alter table public.work_meta enable row level security;

alter table public.jobs enable row level security;

alter table public.development_skills enable row level security;

alter table public.projects enable row level security;

alter table public.project_roles enable row level security;

alter table public.project_tech_stack enable row level security;

alter table public.dev_tools enable row level security;

alter table public.dev_tool_tags enable row level security;

alter table public.product_items enable row level security;

alter table public.product_item_tags enable row level security;

alter table public.hardware_items enable row level security;

alter table public.creation_items enable row level security;

alter table public.media_items enable row level security;

alter table public.performances enable row level security;

alter table public.contact_methods enable row level security;

alter table public.platform_accounts enable row level security;

alter table public.thought_qa enable row level security;

alter table public.notifications enable row level security;

alter table public.messages enable row level security;

alter table public.media_assets enable row level security;

create or replace function public.is_published_profile(target_profile_id uuid) returns boolean language sql stable as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = target_profile_id
      and p.is_published = true
  );
$$;

create policy "public can read published profiles" on public.profiles for select using (is_published = true);

create policy "public can read published profile life" on public.profile_life for select using (public.is_published_profile(profile_id));

create policy "public can read published profile tags" on public.profile_tags for select using (public.is_published_profile(profile_id));

create policy "public can read published profile list items" on public.profile_list_items for select using (public.is_published_profile(profile_id));

create policy "public can read published experiences" on public.experiences for select using (public.is_published_profile(profile_id));

create policy "public can read published schools" on public.schools for select using (public.is_published_profile(profile_id));

create policy "public can read published education meta" on public.education_meta for select using (public.is_published_profile(profile_id));

create policy "public can read published work meta" on public.work_meta for select using (public.is_published_profile(profile_id));

create policy "public can read published jobs" on public.jobs for select using (public.is_published_profile(profile_id));

create policy "public can read published development skills" on public.development_skills for select using (public.is_published_profile(profile_id));

create policy "public can read published projects" on public.projects for select using (public.is_published_profile(profile_id));

create policy "public can read project roles" on public.project_roles for select using ( exists ( select 1 from public.projects p where p.id = project_id and public.is_published_profile(p.profile_id)));

create policy "public can read project tech stack" on public.project_tech_stack for select using ( exists ( select 1 from public.projects p where p.id = project_id and public.is_published_profile(p.profile_id)));

create policy "public can read dev tools" on public.dev_tools for select using (public.is_published_profile(profile_id));

create policy "public can read dev tool tags" on public.dev_tool_tags for select using ( exists ( select 1 from public.dev_tools d where d.id = dev_tool_id and public.is_published_profile(d.profile_id)));

create policy "public can read product items" on public.product_items for select using (public.is_published_profile(profile_id));

create policy "public can read product item tags" on public.product_item_tags for select using ( exists ( select 1 from public.product_items p where p.id = product_item_id and public.is_published_profile(p.profile_id)));

create policy "public can read hardware items" on public.hardware_items for select using (public.is_published_profile(profile_id));

create policy "public can read creation items" on public.creation_items for select using (public.is_published_profile(profile_id));

create policy "public can read media items" on public.media_items for select using (public.is_published_profile(profile_id));

create policy "public can read performances" on public.performances for select using (public.is_published_profile(profile_id));

create policy "public can read contact methods" on public.contact_methods for select using (public.is_published_profile(profile_id));

create policy "public can read platform accounts" on public.platform_accounts for select using (public.is_published_profile(profile_id));

create policy "public can read thought qa" on public.thought_qa for select using (public.is_published_profile(profile_id));

create policy "public can read notifications" on public.notifications for select using (public.is_published_profile(profile_id));

create policy "public can read media assets" on public.media_assets for select using (public.is_published_profile(profile_id));

create policy "public can insert messages" on public.messages for insert with check (public.is_published_profile(profile_id));

create policy "public can read approved messages" on public.messages for select using ( status = 'approved' and public.is_published_profile(profile_id));

grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.profile_life, public.profile_tags, public.profile_list_items, public.experiences, public.schools, public.education_meta, public.work_meta, public.jobs, public.development_skills, public.projects, public.project_roles, public.project_tech_stack, public.dev_tools, public.dev_tool_tags, public.product_items, public.product_item_tags, public.hardware_items, public.creation_items, public.media_items, public.performances, public.contact_methods, public.platform_accounts, public.thought_qa, public.notifications, public.media_assets to anon, authenticated;

grant insert on public.messages to anon, authenticated;

insert into storage.buckets (id, name, public) values ('public-assets', 'public-assets', true), ('private-assets', 'private-assets', false) on conflict (id) do nothing;

create policy "public can read public assets" on storage.objects for select using (bucket_id = 'public-assets');

create policy "authenticated can manage public assets" on storage.objects for all to authenticated using (bucket_id = 'public-assets') with check (bucket_id = 'public-assets');

create policy "authenticated can manage private assets" on storage.objects for all to authenticated using (bucket_id = 'private-assets') with check (bucket_id = 'private-assets');
