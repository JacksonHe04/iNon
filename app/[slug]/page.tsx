import { getPublicPageData } from '@/lib/content/public-page-data';
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
  const pageData = await getPublicPageData(slug);
  const data = pageData.data;

  return (
    <ShellLayout
      data={data}
      publicPath={`/${slug}`}
      showSideNav={false}
      blocks={pageData.layoutConfig.blocks}
      theme={pageData.layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={pageData.layoutConfig} />
      {pageData.profileId ? <PageViewTracker profileId={pageData.profileId} /> : null}
      <Analytics />
    </ShellLayout>
  );
}
