import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminContext } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const assetType = String(formData.get('assetType') || 'misc');
    const title = String(formData.get('title') || '');
    const altText = String(formData.get('altText') || '');
    const folder = String(formData.get('folder') || 'misc');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 查找审计用 profile_id：身份来自中央 iNon SSO，Supabase 仅保存项目档案。
    const { data: adminProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('inon_user_id', admin.user.id)
      .maybeSingle();
    const uploaderProfileId = adminProfile?.id ?? null;

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const safeName = file.name.replace(/\s+/g, '-');
    // 注意：对象路径里的 "profiles/JacksonHe04" 是历史前缀（来自旧「图床归属
    // 默认 profile」语义），现在不再具所有权意义。改这条路径会移动现存 14 个
    // 对象的位置，先保留。
    const objectPath = `profiles/JacksonHe04/${folder}/${Date.now()}-${safeName}`;

    const uploadResult = await adminClient.storage
      .from('public-assets')
      .upload(objectPath, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadResult.error) {
      return NextResponse.json(
        { error: 'Failed to upload file', detail: uploadResult.error.message },
        { status: 500 }
      );
    }

    const publicUrl = adminClient.storage.from('public-assets').getPublicUrl(objectPath).data
      .publicUrl;

    const insertResult = await adminClient.from('media_assets').upsert(
      {
        profile_id: uploaderProfileId,
        bucket: 'public-assets',
        object_path: objectPath,
        asset_type: assetType,
        title,
        alt_text: altText,
        file_name: file.name,
        public_url: publicUrl,
        source_path: '',
        file_size_bytes: file.size,
        is_public: true,
      },
      { onConflict: 'bucket,object_path' }
    );

    if (insertResult.error) {
      return NextResponse.json(
        { error: 'Failed to record asset', detail: insertResult.error.message },
        { status: 500 }
      );
    }

    revalidatePath('/admin/assets');
    return NextResponse.json({ ok: true, publicUrl, objectPath });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Asset upload failed',
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
