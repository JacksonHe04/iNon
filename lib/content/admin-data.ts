import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';

export type AdminMessage = {
  id: string;
  nickname: string;
  content: string;
  contact: string;
  status: 'pending' | 'approved' | 'rejected' | 'spam';
  created_at: string;
};

export type AdminAsset = {
  id: string;
  bucket: string;
  object_path: string;
  asset_type: string;
  title: string;
  alt_text: string;
  file_name: string;
  public_url: string;
  source_path: string;
  file_size_bytes: number | null;
  created_at: string;
};

async function getProfileId() {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('profiles')
    .select('id')
    .eq('slug', DEFAULT_PROFILE_SLUG)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error(`Profile "${DEFAULT_PROFILE_SLUG}" not found`);
  return data.id;
}

export async function listAdminMessages(): Promise<AdminMessage[]> {
  const adminClient = createAdminClient();
  const profileId = await getProfileId();
  const { data, error } = await adminClient
    .from('messages')
    .select('id, nickname, content, contact, status, created_at')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminMessage[];
}

export async function listAdminAssets(): Promise<AdminAsset[]> {
  const adminClient = createAdminClient();
  // 注意：media_assets 现在是全站共享图床，不再按 profile 过滤。
  // 迁移：20260712052043_relax_media_assets_profile_ownership.sql
  const { data, error } = await adminClient
    .from('media_assets')
    .select(
      'id, bucket, object_path, asset_type, title, alt_text, file_name, public_url, source_path, file_size_bytes, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AdminAsset[];
}
