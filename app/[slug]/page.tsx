import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';

export const dynamic = 'force-dynamic';

interface UserPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserPublicPage({ params }: UserPublicPageProps) {
  const { slug } = await params;
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  return (
    <ShellLayout
      data={data}
      username={slug}
      showSideNav={true}
      blocks={layoutConfig.blocks}
      theme={layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={layoutConfig} />
    </ShellLayout>
  );
}
