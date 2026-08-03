import { revalidatePath, revalidateTag } from 'next/cache';

export const PUBLIC_PAGE_CACHE_TAG = 'public-page-data';

export function invalidatePublicPageCache() {
  revalidateTag(PUBLIC_PAGE_CACHE_TAG, { expire: 0 });
  revalidatePath('/');
}
