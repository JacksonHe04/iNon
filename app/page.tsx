import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import { DEFAULT_PROFILE_SLUG } from '@/lib/content/constants';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(''),
    getLayoutConfig(DEFAULT_PROFILE_SLUG),
  ]);

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
