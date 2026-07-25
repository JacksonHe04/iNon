import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth/user';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

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
    username: user.username,
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
  const body: unknown = await req.json();
  const rawSlugs =
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { slugs?: unknown }).slugs)
      ? (body as { slugs: unknown[] }).slugs
      : [];

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

  const { data: otherSlugs } = await adminClient
    .from('profile_slugs')
    .select('profile_id, slug')
    .neq('profile_id', profile.id);

  if (otherSlugs) {
    for (const row of otherSlugs) {
      const rowLower = row.slug.toLowerCase();
      if (seenLower.has(rowLower)) {
        return NextResponse.json(
          { error: `Slug "${row.slug}" 已被其他账号占用` },
          { status: 400 }
        );
      }
    }
  }

  const primarySlug =
    cleanedSlugs.find((s) => s.length > 0) || profile.slug;
  const previousUsername = profile.username || profile.slug;

  const { error: updateProfErr } = await adminClient
    .from('profiles')
    .update({
      slug: primarySlug,
    })
    .eq('id', profile.id)
    .eq('inon_user_id', user.id);

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
  revalidatePath(`/${primarySlug}`);
  revalidatePath(`/i/${primarySlug}`);
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
    username: user.username,
    slugs: cleanedSlugs,
  });
}
