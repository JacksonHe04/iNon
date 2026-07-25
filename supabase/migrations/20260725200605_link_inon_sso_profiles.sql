-- Project-specific profile data remains in Supabase, while identity lives in
-- the central Cloudflare D1 user table. This opaque ID links the two without
-- duplicating credentials, email, or role state.
alter table public.profiles
  add column if not exists inon_user_id text;

create unique index if not exists profiles_inon_user_id_key
  on public.profiles (inon_user_id)
  where inon_user_id is not null;

comment on column public.profiles.inon_user_id is
  'Opaque subject from the central iNon SSO; identity data remains in Cloudflare D1.';
