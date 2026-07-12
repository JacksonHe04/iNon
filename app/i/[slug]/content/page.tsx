import { getReadmeData } from '@/lib/content';
import BlockContentEditorManager from '@/components/editor/BlockContentEditorManager';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserContentPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  const data = await getReadmeData(slug);

  return (
    <div className="space-y-6 animate-fadeIn">
      <BlockContentEditorManager data={data} />
    </div>
  );
}
