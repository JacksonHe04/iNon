import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { getProfileIdBySlug } from '@/lib/analytics/profile-id';
import { listVisibleMessages } from '@/lib/content/messages';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { Analytics } from '@vercel/analytics/next';

export const dynamic = 'force-dynamic';

interface UserPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserPublicPage({ params }: UserPublicPageProps) {
  const { slug } = await params;
  const [data, layoutConfig, profileId] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
    getProfileIdBySlug(slug),
  ]);

  const messages = profileId ? await listVisibleMessages(profileId) : [];

  return (
    <ShellLayout
      data={data}
      username={slug}
      showSideNav={true}
      blocks={layoutConfig.blocks}
      theme={layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={layoutConfig} messages={messages} />
      {profileId ? <PageViewTracker profileId={profileId} /> : null}
      <Analytics />
    </ShellLayout>
  );
}
