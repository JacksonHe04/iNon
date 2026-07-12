import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type UserProfile = {
  id: string;
  slug: string;
  username: string | null;
  slugs: string[];
};

export type UserContext = {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile;
};

export function getPrimaryUsername(profile: Pick<UserProfile, 'username' | 'slug'>): string {
  return profile.username || profile.slug || '';
}

export function profileOwnsIdentifier(profile: UserProfile, identifier: string): boolean {
  const lower = identifier.toLowerCase();
  if (profile.username?.toLowerCase() === lower) return true;
  if (profile.slug?.toLowerCase() === lower) return true;
  return profile.slugs.some((slug) => slug.toLowerCase() === lower);
}

export async function loadUserProfile(userId: string): Promise<UserProfile | null> {
  const adminClient = createAdminClient();

  const { data: profile, error } = await adminClient
    .from('profiles')
    .select('id, slug, username')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !profile) {
    return null;
  }

  let slugs: string[] = [];
  const { data: slugRows } = await adminClient
    .from('profile_slugs')
    .select('slug')
    .eq('profile_id', profile.id);

  if (slugRows && slugRows.length > 0) {
    slugs = slugRows.map((row) => row.slug);
  } else if (profile.slug) {
    slugs = [profile.slug];
  }

  return {
    id: profile.id,
    slug: profile.slug,
    username: profile.username,
    slugs,
  };
}

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) {
    return null;
  }

  const profile = await loadUserProfile(user.id);
  if (!profile) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile,
  };
}

export async function requireUserPage(next: string): Promise<UserContext> {
  const context = await getUserContext();

  if (!context) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return context;
}

export async function requireOwnerPage(identifier: string, next: string): Promise<UserContext> {
  const context = await requireUserPage(next);

  if (!profileOwnsIdentifier(context.profile, identifier)) {
    redirect(`/i/${getPrimaryUsername(context.profile)}/home`);
  }

  return context;
}
