import { NextResponse } from 'next/server';
import { getUserContext } from '@/lib/auth/user';
import { listOwnerMessages, setMessageVisibility } from '@/lib/content/messages';

export async function GET() {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const messages = await listOwnerMessages(userContext.profile.id);
    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch messages', detail: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const userContext = await getUserContext();
  if (!userContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { messageId?: unknown; visible?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const messageId = typeof body.messageId === 'string' ? body.messageId : '';
  const visible = typeof body.visible === 'boolean' ? body.visible : null;

  if (!messageId || visible === null) {
    return NextResponse.json({ error: 'messageId and visible are required' }, { status: 400 });
  }

  try {
    await setMessageVisibility(messageId, visible, userContext.profile.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update message', detail: (error as Error).message },
      { status: 500 }
    );
  }
}