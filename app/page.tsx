import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';
import { deduplicateReadmeData } from '@/lib/content/deduplicate';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [rawData, layoutConfig] = await Promise.all([
    getReadmeData(''),
    getLayoutConfig(DEFAULT_PROFILE_SLUG),
  ]);

  const data = deduplicateReadmeData(rawData);

  return (
    <ShellLayout
      data={data}
      username={data.basic.name || ''}
      showSideNav={true}
      blocks={layoutConfig.blocks}
      theme={layoutConfig.theme}
    >
      <PublicBlockRenderer data={data} layoutConfig={layoutConfig} />
    </ShellLayout>
  );
}
