import { getReadmeData } from '@/lib/content';
import ConsoleHomeContent from '@/components/dashboard/ConsoleHomeContent';

export const dynamic = 'force-dynamic';

interface UserDashboardHomePageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardHomePage({ params }: UserDashboardHomePageProps) {
  const { slug } = await params;
  const data = await getReadmeData(slug);

  return <ConsoleHomeContent data={data} />;
}
