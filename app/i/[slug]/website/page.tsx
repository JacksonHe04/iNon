import { getReadmeData } from '@/lib/content';
import { getLayoutConfig } from '@/lib/content/layout';
import WebsiteCanvasClient from '@/components/dashboard/WebsiteCanvasClient';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserWebsitePage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  const [data, layoutConfig] = await Promise.all([
    getReadmeData(slug),
    getLayoutConfig(slug),
  ]);

  return <WebsiteCanvasClient data={data} layoutConfig={layoutConfig} />;
}
