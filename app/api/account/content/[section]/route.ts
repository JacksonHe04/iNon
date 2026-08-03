import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth/user';
import {
  updateContactSection,
  updateCreationSection,
  updateDevelopmentSection,
  updateEducationSection,
  updateEventsSection,
  updateExperienceSection,
  updateLifeSection,
  updateLibrarySection,
  updateNotificationsSection,
  updateProductsSection,
  updateProfileSection,
  updateThoughtsSection,
  updateWorkSection,
} from '@/lib/content/admin-mutations';
import { invalidatePublicPageCache } from '@/lib/content/public-cache';

type RouteContext = {
  params: Promise<{ section: string }>;
};

function userScope(userId: string) {
  return { kind: 'user' as const, userId };
}

export async function PUT(req: Request, context: RouteContext) {
  const user = await getUserContext();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await context.params;
  const body = await req.json();
  const scope = userScope(user.user.id);

  try {
    switch (section) {
      case 'profile':
        await updateProfileSection(
          body as Parameters<typeof updateProfileSection>[0],
          scope
        );
        break;
      case 'life':
        await updateLifeSection(
          body as Parameters<typeof updateLifeSection>[0],
          scope
        );
        break;
      case 'experience':
        await updateExperienceSection(
          body as Parameters<typeof updateExperienceSection>[0],
          scope
        );
        break;
      case 'education':
        await updateEducationSection(
          body as Parameters<typeof updateEducationSection>[0],
          scope
        );
        break;
      case 'work':
        await updateWorkSection(
          body as Parameters<typeof updateWorkSection>[0],
          scope
        );
        break;
      case 'development':
        await updateDevelopmentSection(
          body as Parameters<typeof updateDevelopmentSection>[0],
          scope
        );
        break;
      case 'products':
        await updateProductsSection(
          body as Parameters<typeof updateProductsSection>[0],
          scope
        );
        break;
      case 'creation':
        await updateCreationSection(
          body as Parameters<typeof updateCreationSection>[0],
          scope
        );
        break;
      case 'library':
        await updateLibrarySection(
          body as Parameters<typeof updateLibrarySection>[0],
          scope
        );
        break;
      case 'events':
        await updateEventsSection(
          body as Parameters<typeof updateEventsSection>[0],
          scope
        );
        break;
      case 'contact':
        await updateContactSection(
          body as Parameters<typeof updateContactSection>[0],
          scope
        );
        break;
      case 'thoughts':
        await updateThoughtsSection(
          body as Parameters<typeof updateThoughtsSection>[0],
          scope
        );
        break;
      case 'notifications':
        await updateNotificationsSection(
          body as Parameters<typeof updateNotificationsSection>[0],
          scope
        );
        break;
      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
    }

    invalidatePublicPageCache();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update section',
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
