import { requireOwnerPage } from '@/lib/auth/user';
import AccountSettingsForm from '@/components/account/AccountSettingsForm';

export const dynamic = 'force-dynamic';

interface UserDashboardPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserAccountPage({ params }: UserDashboardPageProps) {
  const { slug } = await params;
  const userContext = await requireOwnerPage(slug, `/i/${slug}/account`);

  const initialEmail = userContext.user.email;
  const initialSlugs = userContext.profile.slugs;

  return (
    <div className="space-y-6 animate-fadeIn">
      <AccountSettingsForm
        currentUsername={slug}
        initialEmail={initialEmail}
        initialSlugs={initialSlugs}
      />
    </div>
  );
}