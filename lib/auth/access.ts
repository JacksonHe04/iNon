import { createAdminClient } from '@/lib/supabase/admin';
import {
  getPrimaryUsername,
  loadUserProfile,
  profileOwnsIdentifier,
} from '@/lib/auth/user';

export async function checkIsAdmin(userId: string, email?: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const normalizedEmail = email?.toLowerCase();

  let query = adminClient
    .from('admin_users')
    .select('id')
    .eq('is_active', true);

  if (normalizedEmail) {
    query = query.or(`user_id.eq.${userId},email.eq.${normalizedEmail}`);
  } else {
    query = query.eq('user_id', userId);
  }

  const { data } = await query.maybeSingle();
  return Boolean(data);
}

export async function checkUserOwnsIdentifier(
  userId: string,
  identifier: string
): Promise<boolean> {
  const profile = await loadUserProfile(userId);
  if (!profile) {
    return false;
  }

  return profileOwnsIdentifier(profile, identifier);
}

export async function getUserDashboardPath(userId: string): Promise<string | null> {
  const profile = await loadUserProfile(userId);
  if (!profile) {
    return null;
  }

  const username = getPrimaryUsername(profile);
  return username ? `/i/${username}` : '/i';
}
