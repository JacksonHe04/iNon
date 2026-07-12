import { redirect } from 'next/navigation';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserDashboardPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  redirect(`/i/${slug}/home`);
}
