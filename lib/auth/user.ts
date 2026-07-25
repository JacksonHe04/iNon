import type { InonProjectSession } from "@inon-ai/inon-sso";
import { redirect } from "next/navigation";
import { getInonProjectSession } from "@/lib/sso/project-session";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserProfile = {
  id: string;
  slug: string;
  username: string | null;
  slugs: string[];
};

export type UserContext = {
  user: {
    id: string;
    email: string;
    username: string | null;
  };
  profile: UserProfile;
};

type ProfileRow = {
  id: string;
  slug: string;
  username: string | null;
};

export function getPrimaryUsername(
  profile: Pick<UserProfile, "username" | "slug">,
): string {
  return profile.username || profile.slug || "";
}

export function profileOwnsIdentifier(
  profile: UserProfile,
  identifier: string,
): boolean {
  const lower = identifier.toLowerCase();
  if (profile.username?.toLowerCase() === lower) return true;
  if (profile.slug?.toLowerCase() === lower) return true;
  return profile.slugs.some((slug) => slug.toLowerCase() === lower);
}

async function profileWithSlugs(
  profile: ProfileRow,
): Promise<UserProfile> {
  const adminClient = createAdminClient();
  const { data: slugRows } = await adminClient
    .from("profile_slugs")
    .select("slug")
    .eq("profile_id", profile.id);
  const slugs =
    slugRows && slugRows.length > 0
      ? slugRows.map((row) => row.slug)
      : profile.slug
        ? [profile.slug]
        : [];

  return {
    id: profile.id,
    slug: profile.slug,
    username: profile.username,
    slugs,
  };
}

export async function loadUserProfile(
  inonUserId: string,
): Promise<UserProfile | null> {
  const adminClient = createAdminClient();
  const { data: profile, error } = await adminClient
    .from("profiles")
    .select("id, slug, username")
    .eq("inon_user_id", inonUserId)
    .maybeSingle<ProfileRow>();

  return error || !profile ? null : profileWithSlugs(profile);
}

async function linkLegacyProfile(
  session: InonProjectSession,
): Promise<UserProfile | null> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) {
    return null;
  }

  const legacyUser = data.users.find(
    (user) => user.email?.toLowerCase() === session.email.toLowerCase(),
  );
  if (!legacyUser) {
    return null;
  }

  const { data: legacyProfile } = await adminClient
    .from("profiles")
    .select("id, slug, username, inon_user_id")
    .eq("user_id", legacyUser.id)
    .maybeSingle<
      ProfileRow & {
        inon_user_id: string | null;
      }
    >();
  if (!legacyProfile) {
    return null;
  }
  if (
    legacyProfile.inon_user_id !== null &&
    legacyProfile.inon_user_id !== session.id
  ) {
    throw new Error("The legacy profile is linked to another iNon account.");
  }

  if (legacyProfile.inon_user_id === null) {
    const { error: linkError } = await adminClient
      .from("profiles")
      .update({ inon_user_id: session.id })
      .eq("id", legacyProfile.id)
      .is("inon_user_id", null);
    if (linkError) {
      return loadUserProfile(session.id);
    }
  }

  return profileWithSlugs(legacyProfile);
}

function baseProfileSlug(session: InonProjectSession): string {
  const candidate =
    session.username?.trim() || session.email.split("@")[0] || "member";
  return (
    candidate
      .replace(/[^\p{L}\p{N}_-]+/gu, "-")
      .replace(/^-+|-+$/g, "") || "member"
  );
}

async function createProjectProfile(
  session: InonProjectSession,
): Promise<UserProfile | null> {
  const adminClient = createAdminClient();
  const baseSlug = baseProfileSlug(session);
  const name = session.username ?? session.email.split("@")[0] ?? "iNon user";
  const initial = await adminClient
    .from("profiles")
    .insert({
      slug: baseSlug,
      username: session.username,
      name,
      meta_title: name,
      inon_user_id: session.id,
    })
    .select("id, slug, username")
    .single<ProfileRow>();
  const created =
    initial.data ??
    (
      await adminClient
        .from("profiles")
        .insert({
          slug: `${baseSlug}-${session.id.slice(-8)}`,
          username: null,
          name,
          meta_title: name,
          inon_user_id: session.id,
        })
        .select("id, slug, username")
        .single<ProfileRow>()
    ).data;

  if (!created) {
    return loadUserProfile(session.id);
  }

  await adminClient.from("profile_slugs").upsert(
    {
      profile_id: created.id,
      slug: created.slug,
    },
    { onConflict: "slug" },
  );
  return profileWithSlugs(created);
}

async function resolveProjectProfile(
  session: InonProjectSession,
): Promise<UserProfile | null> {
  return (
    (await loadUserProfile(session.id)) ??
    (await linkLegacyProfile(session)) ??
    (await createProjectProfile(session))
  );
}

export async function getUserContext(): Promise<UserContext | null> {
  const session = await getInonProjectSession();
  if (!session) {
    return null;
  }

  const profile = await resolveProjectProfile(session);
  if (!profile) {
    return null;
  }

  return {
    user: {
      id: session.id,
      email: session.email,
      username: session.username,
    },
    profile,
  };
}

export async function requireUserPage(next: string): Promise<UserContext> {
  const context = await getUserContext();
  if (!context) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }
  return context;
}

export async function requireOwnerPage(
  identifier: string,
  next: string,
): Promise<UserContext> {
  const context = await requireUserPage(next);
  if (!profileOwnsIdentifier(context.profile, identifier)) {
    redirect(`/i/${getPrimaryUsername(context.profile)}/home`);
  }
  return context;
}
