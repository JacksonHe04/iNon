import type { Metadata } from 'next';
import { getCachedSiteMetadata } from '@/lib/content/site-metadata';
import { Providers } from '@/components/providers';
import ArchiveAtmosphere from '@/components/archive/ArchiveAtmosphere';
import './globals.css';
import './styles/archive-responsive.css';
import './styles/world-foundation.css';
import './styles/archive-field-panels.css';
import './styles/world-navigation.css';
import './styles/world-panels-hud.css';
import './styles/world-inventory-responsive.css';
import './styles/world-collection-realms.css';
import './styles/world-interior-overlay.css';
import './styles/public-atmosphere.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteMeta = await getCachedSiteMetadata();

  return {
    title: siteMeta.title,
    description: siteMeta.description,
    authors: [{ name: siteMeta.author }],
    openGraph: {
      title: siteMeta.title,
      description: siteMeta.description,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="archive-app antialiased">
        <Providers>
          <ArchiveAtmosphere />
          {children}
        </Providers>
      </body>
    </html>
  );
}
