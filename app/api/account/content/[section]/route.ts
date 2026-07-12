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
        await updateProfileSection(body, scope);
        break;
      case 'life':
        await updateLifeSection(body, scope);
        break;
      case 'experience':
        await updateExperienceSection(body, scope);
        break;
      case 'education':
        await updateEducationSection(body, scope);
        break;
      case 'work':
        await updateWorkSection(body, scope);
        break;
      case 'development':
        await updateDevelopmentSection(body, scope);
        break;
      case 'products':
        await updateProductsSection(body, scope);
        break;
      case 'creation':
        await updateCreationSection(body, scope);
        break;
      case 'library':
        await updateLibrarySection(body, scope);
        break;
      case 'events':
        await updateEventsSection(body, scope);
        break;
      case 'contact':
        await updateContactSection(body, scope);
        break;
      case 'thoughts':
        await updateThoughtsSection(body, scope);
        break;
      case 'notifications':
        await updateNotificationsSection(body, scope);
        break;
      default:
        return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
    }

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
