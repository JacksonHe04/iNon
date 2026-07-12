import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/admin/auth';
import {
  updateContactSection,
  updateCreationSection,
  updateDevelopmentSection,
  updateEducationSection,
  updateEventsSection,
  updateExperienceSection,
  updateLifeSection,
  updateLibrarySection,
  updateMessageStatus,
  updateNotificationsSection,
  updateProductsSection,
  updateProfileSection,
  updateThoughtsSection,
  updateWorkSection,
} from '@/lib/content/admin-mutations';

type RouteContext = {
  params: Promise<{ section: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await context.params;
  const body = await req.json();

  try {
    switch (section) {
      case 'profile':
        await updateProfileSection(body);
        break;
      case 'life':
        await updateLifeSection(body);
        break;
      case 'experience':
        await updateExperienceSection(body);
        break;
      case 'education':
        await updateEducationSection(body);
        break;
      case 'work':
        await updateWorkSection(body);
        break;
      case 'development':
        await updateDevelopmentSection(body);
        break;
      case 'products':
        await updateProductsSection(body);
        break;
      case 'creation':
        await updateCreationSection(body);
        break;
      case 'library':
        await updateLibrarySection(body);
        break;
      case 'events':
        await updateEventsSection(body);
        break;
      case 'contact':
        await updateContactSection(body);
        break;
      case 'thoughts':
        await updateThoughtsSection(body);
        break;
      case 'notifications':
        await updateNotificationsSection(body);
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

export async function PATCH(req: Request, context: RouteContext) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section } = await context.params;
  if (section !== 'messages') {
    return NextResponse.json({ error: 'Unknown section' }, { status: 404 });
  }

  try {
    const body = (await req.json()) as { messageId: string; status: 'approved' | 'rejected' | 'spam' };
    await updateMessageStatus(body.messageId, body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to update message',
        detail: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
