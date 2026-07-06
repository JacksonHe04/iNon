import { getReadmeData } from '@/lib/content';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getReadmeData('');

  return (
    <ShellLayout data={data} username={data.basic.name || ''} showSideNav={true}>
      <PublicBlockRenderer data={data} />
    </ShellLayout>
  );
}
