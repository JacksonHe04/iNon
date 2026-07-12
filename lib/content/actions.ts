'use server';

import { getReadmeData } from './index';
import { getUserContext } from '@/lib/auth/user';
import { listOwnerMessages } from './messages';

export async function fetchReadmeDataAction(slug: string) {
  const context = await getUserContext();
  if (!context) {
    throw new Error('Unauthorized');
  }
  return getReadmeData(slug);
}

export async function fetchOwnerMessagesAction(profileId: string) {
  const context = await getUserContext();
  if (!context || context.profile.id !== profileId) {
    throw new Error('Unauthorized');
  }
  return listOwnerMessages(profileId);
}

