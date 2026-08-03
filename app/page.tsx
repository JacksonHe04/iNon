import { getPublicPageData } from '@/lib/content/public-page-data';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';
import { deduplicateReadmeData } from '@/lib/content/deduplicate';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const pageData = await getPublicPageData('');
  const data = deduplicateReadmeData(pageData.data);

  return (
    <ShellLayout
      data={data}
      username={data.basic.name || ''}
      showSideNav={true}
      blocks={pageData.layoutConfig.blocks}
      theme={pageData.layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={pageData.layoutConfig} />
    </ShellLayout>
  );
}
