import { getPublicPageData } from '@/lib/content/public-page-data';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const pageData = await getPublicPageData('');
  const data = pageData.data;

  return (
    <ShellLayout
      data={data}
      publicPath="/"
      showSideNav={false}
      blocks={pageData.layoutConfig.blocks}
      theme={pageData.layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={pageData.layoutConfig} />
    </ShellLayout>
  );
}
