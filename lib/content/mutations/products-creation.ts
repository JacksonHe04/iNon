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
  stringRows,
} from './helpers';

export async function updateProductsSection(
  data: ReadmeData['products'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  const existingItems = await adminClient
    .from('product_items')
    .select('id')
    .eq('profile_id', profile.id);
  if (existingItems.error) throw existingItems.error;
  const productItemIds = (existingItems.data ?? []).map((item) => item.id);
  await replaceRelatedRows(adminClient, 'product_item_tags', 'product_item_id', productItemIds, []);

  const productRows = await replaceProfileScopedRows(adminClient, 'product_items', profile.id, [
    ...data.favorite_products.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'favorite_product',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.recommended_products.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'recommended_product',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.favorite_brands.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'favorite_brand',
      name: ensureString(item.name),
      link: ensureString(item.link),
      intro: ensureString(item.intro),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
  ]);

  const sourceItems = [
    ...data.favorite_products,
    ...data.recommended_products,
    ...data.favorite_brands,
  ];
  const tagRows = productRows.flatMap((productRow, index) =>
    ensureStringArray(sourceItems[index]?.tags).map((value, tagIndex) => ({
      product_item_id: productRow.id,
      value,
      sort_order: tagIndex,
    }))
  );
  if (tagRows.length) {
    const { error } = await adminClient.from('product_item_tags').insert(tagRows);
    if (error) throw error;
  }

  await replaceProfileScopedRows(adminClient, 'hardware_items', profile.id, [
    {
      profile_id: profile.id,
      category: 'phone',
      value: ensureString(data.my_hardware.phone),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'computer',
      value: ensureString(data.my_hardware.computer),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'tablet',
      value: ensureString(data.my_hardware.tablet),
      sort_order: 0,
    },
    {
      profile_id: profile.id,
      category: 'smartwatch',
      value: ensureString(data.my_hardware.smartwatch),
      sort_order: 0,
    },
    ...ensureStringArray(data.my_hardware.headphones).map((value, index) => ({
      profile_id: profile.id,
      category: 'headphones',
      value,
      sort_order: index,
    })),
  ]);

  revalidatePath('/');
  revalidatePath('/admin/content');
}

export async function updateCreationSection(
  data: ReadmeData['creation'],
  scope: MutationScope = { kind: 'admin' }
) {
  const adminClient = createAdminClient();
  const profile = await getProfile(adminClient, scope);

  await replaceProfileScopedRows(adminClient, 'creation_items', profile.id, [
    ...data.videos.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'video',
      series: ensureString(item.series),
      title: ensureString(item.title),
      link_primary: ensureString(item.video_link),
      link_secondary: ensureString(item.podcast_link),
      excerpt: '',
      outline_doc: '',
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.articles.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'article',
      series: '',
      title: ensureString(item.title),
      link_primary: ensureString(item.link),
      link_secondary: '',
      excerpt: ensureString(item.excerpt),
      outline_doc: '',
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
    ...data.speeches.map((item, index) => ({
      profile_id: profile.id,
      item_type: 'speech',
      series: '',
      title: ensureString(item.speech_name),
      link_primary: ensureString(item.link),
      link_secondary: ensureString(item.presentation_link),
      excerpt: '',
      outline_doc: ensureString(item.outline_doc),
      image_url: ensureString(item.image_url),
      sort_order: index,
    })),
  ]);

  const { error: deleteError } = await adminClient
    .from('profile_list_items')
    .delete()
    .eq('profile_id', profile.id)
    .in('list_type', ['motto', 'quote']);
  if (deleteError) throw deleteError;

  const listRows = [
    ...stringRows(profile.id, 'motto', ensureStringArray(data.mottos)),
    ...stringRows(profile.id, 'quote', ensureStringArray(data.quotes)),
  ];
  if (listRows.length) {
    const { error } = await adminClient.from('profile_list_items').insert(listRows);
    if (error) throw error;
  }

  revalidatePath('/');
  revalidatePath('/admin/content');
}
