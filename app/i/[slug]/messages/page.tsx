import { requireOwnerPage } from '@/lib/auth/user';
import { loadProfile } from '@/lib/content/db-helpers';
import { listOwnerMessages } from '@/lib/content/messages';
import MessageBoardManager from '@/components/dashboard/MessageBoardManager';

export const dynamic = 'force-dynamic';

interface UserMessagesPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserMessagesPage({ params }: UserMessagesPageProps) {
  const { slug } = await params;
  await requireOwnerPage(slug, `/i/${slug}/messages`);

  const { data: profile } = await loadProfile(slug);
  if (!profile) {
    return (
      <div className="text-sm text-gray-500">未找到对应的档案。</div>
    );
  }

  const messages = await listOwnerMessages(profile.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      <MessageBoardManager initialMessages={messages} />
    </div>
  );
}
