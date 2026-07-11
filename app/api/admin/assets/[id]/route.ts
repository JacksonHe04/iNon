import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminContext } from '@/lib/admin/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    const adminClient = createAdminClient();

    // 1. 获取对应的 media_asset 详情以拿到 bucket 和 object_path
    const { data: asset, error: fetchError } = await adminClient
      .from('media_assets')
      .select('bucket, object_path')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // 2. 从 Supabase Storage 中移除物理对象
    const { error: storageError } = await adminClient.storage
      .from(asset.bucket)
      .remove([asset.object_path]);

    if (storageError) {
      console.error('Storage removal error:', storageError);
      // 继续删除数据库记录以防不安全/不一致
    }

    // 3. 从 media_assets 数据表中删除记录
    const { error: deleteError } = await adminClient
      .from('media_assets')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    revalidatePath('/admin/assets');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete asset', detail: (error as Error).message },
      { status: 500 }
    );
  }
}
