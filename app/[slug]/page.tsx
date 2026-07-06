import { getReadmeData } from '@/lib/content';
import ShellLayout from '@/components/layout/ShellLayout';
import PublicBlockRenderer from '@/components/blocks/PublicBlockRenderer';

export const dynamic = 'force-dynamic';

interface UserPublicPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserPublicPage({ params }: UserPublicPageProps) {
  const { slug } = await params;
  const data = await getReadmeData(slug);

  return (
    <ShellLayout data={data} username={slug} showSideNav={true}>
      <PublicBlockRenderer data={data} />
    </ShellLayout>
  );
}
