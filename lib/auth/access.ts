import {
  getPrimaryUsername,
  loadUserProfile,
  profileOwnsIdentifier,
} from '@/lib/auth/user';
import { getInonProjectAdminSession } from '@/lib/sso/project-session';

export async function checkIsAdmin(): Promise<boolean> {
  return (await getInonProjectAdminSession()) !== null;
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
  return username ? `/i/${username}/home` : '/i';
}
