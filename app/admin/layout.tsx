import type { ReactNode } from 'react';
import { requireAdminPage } from '@/lib/admin/auth';
import { getReadmeData } from '@/lib/content';
import ShellLayout from '@/components/layout/ShellLayout';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage('/admin');
  const username = admin.user.username || admin.user.email.split('@')[0];
  const data = await getReadmeData(username);

  return (
    <ShellLayout data={data} publicPath={`/${username}`} showSideNav={false}>
      <div className="min-h-[calc(100vh-6rem)] archive-admin">
        <main className="mx-auto max-w-7xl py-8">{children}</main>
      </div>
    </ShellLayout>
  );
}
