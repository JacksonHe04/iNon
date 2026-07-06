import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';

function isValidIdentifier(val: string): boolean {
  if (val === '') return true;
  return /^[a-zA-Z0-9_-]{2,32}$/.test(val);
}

export async function GET() {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profile, user } = userContext;
  const adminClient = createAdminClient();

  const { data: profileRow } = await adminClient
    .from('profiles')
    .select('name')
    .eq('id', profile.id)
    .maybeSingle();

  const slugs = profile.slugs.length > 0 ? profile.slugs : profile.slug ? [profile.slug] : [];

  return NextResponse.json({
    ok: true,
    profileId: profile.id,
    username: profile.username || profile.slug || DEFAULT_PROFILE_SLUG,
    name: profileRow?.name ?? null,
    slugs,
    email: user.email,
  });
}

export async function PUT(req: Request) {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { profile, user } = userContext;
  const body = await req.json();
  const rawUsername = typeof body.username === 'string' ? body.username.trim() : '';
  const rawSlugs = Array.isArray(body.slugs) ? body.slugs : [];

  if (!rawUsername) {
    return NextResponse.json({ error: '用户名不能为空' }, { status: 400 });
  }

  if (!/^[a-zA-Z0-9_-]{2,32}$/.test(rawUsername)) {
    return NextResponse.json(
      { error: '用户名格式不符合要求（仅支持 2-32 位英文字母、数字、下划线及减号）' },
      { status: 400 }
    );
  }

  const cleanedSlugs: string[] = [];
  const seenLower = new Set<string>();

  for (const s of rawSlugs) {
    const trimmed = typeof s === 'string' ? s.trim() : '';
    if (!isValidIdentifier(trimmed)) {
      return NextResponse.json(
        { error: `Slug "${trimmed}" 格式不正确（仅支持空字符串，或 2-32 位字母、数字、下划线、减号）` },
        { status: 400 }
      );
    }
    const lower = trimmed.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      cleanedSlugs.push(trimmed);
    }
  }

  const adminClient = createAdminClient();

  const { data: existingUser } = await adminClient
    .from('profiles')
    .select('id')
    .neq('id', profile.id)
    .or(`username.ilike.${rawUsername},slug.ilike.${rawUsername}`)
    .maybeSingle();

  if (existingUser) {
    return NextResponse.json(
      { error: `用户名 "${rawUsername}" 已被其他账号占用` },
      { status: 400 }
    );
  }

  const { data: otherSlugs } = await adminClient
    .from('profile_slugs')
    .select('profile_id, slug')
    .neq('profile_id', profile.id);

  if (otherSlugs) {
    for (const row of otherSlugs) {
      const rowLower = row.slug.toLowerCase();
      if (rowLower === rawUsername.toLowerCase()) {
        return NextResponse.json(
          { error: `用户名 "${rawUsername}" 与其他账号的路径 Slug 冲突` },
          { status: 400 }
        );
      }
      if (seenLower.has(rowLower)) {
        return NextResponse.json(
          { error: `Slug "${row.slug}" 已被其他账号占用` },
          { status: 400 }
        );
      }
    }
  }

  const primarySlug = cleanedSlugs.find((s) => s.length > 0) || rawUsername;
  const previousUsername = profile.username || profile.slug;

  const { error: updateProfErr } = await adminClient
    .from('profiles')
    .update({
      username: rawUsername,
      slug: primarySlug,
    })
    .eq('id', profile.id)
    .eq('user_id', user.id);

  if (updateProfErr) {
    return NextResponse.json({ error: updateProfErr.message }, { status: 500 });
  }

  await adminClient.from('profile_slugs').delete().eq('profile_id', profile.id);
  const slugInsertRows = cleanedSlugs.map((s) => ({
    profile_id: profile.id,
    slug: s,
  }));
  if (slugInsertRows.length > 0) {
    await adminClient.from('profile_slugs').insert(slugInsertRows);
  }

  revalidatePath('/');
  revalidatePath('/i');
  revalidatePath(`/${rawUsername}`);
  revalidatePath(`/i/${rawUsername}`);
  if (previousUsername) {
    revalidatePath(`/${previousUsername}`);
    revalidatePath(`/i/${previousUsername}`);
  }
  for (const s of cleanedSlugs) {
    if (s) {
      revalidatePath(`/${s}`);
      revalidatePath(`/i/${s}`);
    }
  }

  return NextResponse.json({
    ok: true,
    username: rawUsername,
    slugs: cleanedSlugs,
  });
}
