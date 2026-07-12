import { getReadmeData } from '@/lib/content';
import LibraryEditorManager from '@/components/editor/LibraryEditorManager';

export const dynamic = 'force-dynamic';

interface LibraryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function LibraryPage({ params }: LibraryPageProps) {
  const { slug } = await params;
  const data = await getReadmeData(slug);

  return (
    <div className="space-y-6 animate-fadeIn">
      <LibraryEditorManager initialLibrary={data.library} />
    </div>
  );
}
