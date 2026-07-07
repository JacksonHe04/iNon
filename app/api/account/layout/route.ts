import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';
import type { LayoutConfig } from '@/types/layout';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profile } = userContext;
  const adminClient = createAdminClient();

  try {
    const { data: profileRow, error } = await adminClient
      .from('profiles')
      .select('layout_config')
      .eq('id', profile.id)
      .maybeSingle();

    if (error) {
      console.warn('Failed to query layout_config from Supabase profiles:', error.message);
      return NextResponse.json({
        ok: true,
        layoutConfig: DEFAULT_LAYOUT_CONFIG,
      });
    }

    const layoutConfig: LayoutConfig = (profileRow?.layout_config as LayoutConfig) || DEFAULT_LAYOUT_CONFIG;

    return NextResponse.json({
      ok: true,
      layoutConfig,
    });
  } catch (err) {
    console.error('Error in GET /api/account/layout:', err);
    return NextResponse.json({
      ok: true,
      layoutConfig: DEFAULT_LAYOUT_CONFIG,
    });
  }
}

export async function PUT(req: Request) {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profile, user } = userContext;
  const body = await req.json();
  const layoutConfig: LayoutConfig = body.layoutConfig;

  if (!layoutConfig || !Array.isArray(layoutConfig.blocks)) {
    return NextResponse.json({ error: 'Invalid layout configuration structure' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  try {
    const { error } = await adminClient
      .from('profiles')
      .update({
        layout_config: layoutConfig,
      })
      .eq('id', profile.id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to update layout_config in profiles:', error.message);
      if (error.message.includes('layout_config') || error.message.includes('schema cache')) {
        return NextResponse.json(
          { error: '数据库尚未应用 layout_config 字段迁移，请在 Supabase 执行最新 SQL migration' },
          { status: 500 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath('/');
    revalidatePath('/i');
    for (const s of profile.slugs) {
      revalidatePath(s ? `/${s}` : '/');
      revalidatePath(s ? `/i/${s}` : '/i');
    }
    if (profile.username) {
      revalidatePath(`/${profile.username}`);
      revalidatePath(`/i/${profile.username}`);
    }

    return NextResponse.json({
      ok: true,
      layoutConfig,
    });
  } catch (err) {
    console.error('Error in PUT /api/account/layout:', err);
    return NextResponse.json(
      { error: (err as Error).message || '保存排版设置失败' },
      { status: 500 }
    );
  }
}
