import { requireOwnerPage } from '@/lib/auth/user';
import AnalyticsSection from '@/components/account/AnalyticsSection';
import {
  getPageViewSummary,
  getPageViewTop,
  getPageViewTotals,
} from '@/lib/analytics/queries';

export const dynamic = 'force-dynamic';

interface UserAnalyticsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UserAnalyticsPage({ params }: UserAnalyticsPageProps) {
  const { slug } = await params;
  const userContext = await requireOwnerPage(slug, `/i/${slug}/analytics`);
  const profileId = userContext.profile.id;

  const [summary, totals, sources, paths, devices, browsers, countries] =
    await Promise.all([
      getPageViewSummary(profileId, 30),
      getPageViewTotals(profileId, 30),
      getPageViewTop(profileId, 'sources', 30, 10),
      getPageViewTop(profileId, 'paths', 30, 10),
      getPageViewTop(profileId, 'devices', 30, 10),
      getPageViewTop(profileId, 'browsers', 30, 10),
      getPageViewTop(profileId, 'countries', 30, 10),
    ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <AnalyticsSection
        summary={summary}
        totals={totals}
        sources={sources}
        paths={paths}
        devices={devices}
        browsers={browsers}
        countries={countries}
      />
    </div>
  );
}
