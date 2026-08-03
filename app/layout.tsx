import type { Metadata } from 'next';
import { getSiteMetadata } from '@/lib/content';
import { Providers } from '@/components/providers';
import ArchiveAtmosphere from '@/components/archive/ArchiveAtmosphere';
import './globals.css';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const siteMeta = await getSiteMetadata();

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
