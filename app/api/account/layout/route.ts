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

  const { data: profileRow } = await adminClient
    .from('profiles')
    .select('layout_config')
    .eq('id', profile.id)
    .maybeSingle();

  const layoutConfig: LayoutConfig = (profileRow?.layout_config as LayoutConfig) || DEFAULT_LAYOUT_CONFIG;

  return NextResponse.json({
    ok: true,
    layoutConfig,
  });
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

  const { error } = await adminClient
    .from('profiles')
    .update({
      layout_config: layoutConfig,
    })
    .eq('id', profile.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/');
  revalidatePath('/i');
  for (const s of profile.slugs) {
    if (s) {
      revalidatePath(`/${s}`);
      revalidatePath(`/i/${s}`);
    }
  }
  if (profile.username) {
    revalidatePath(`/${profile.username}`);
    revalidatePath(`/i/${profile.username}`);
  }

  return NextResponse.json({
    ok: true,
    layoutConfig,
  });
}
