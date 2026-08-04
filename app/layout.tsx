import type { Metadata } from 'next';
import { getCachedSiteMetadata } from '@/lib/content/site-metadata';
import { Providers } from '@/components/providers';
import ArchiveAtmosphere from '@/components/archive/ArchiveAtmosphere';
import './globals.css';
import './styles/archive-materials.css';
import './styles/archive-base-components.css';
import './styles/base-responsive.css';
import './styles/archive-verdant-shell.css';
import './styles/archive-composition.css';
import './styles/archive-block-ornaments.css';
import './styles/archive-dashboard-admin.css';
import './styles/archive-responsive.css';
import './styles/archive-codex-panels.css';
import './styles/world-foundation.css';
import './styles/archive-field-panels.css';
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
