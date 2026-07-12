import type { ReactNode } from 'react';
import { requireAdminPage } from '@/lib/admin/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage('/admin');

  return (
    <div className="min-h-screen bg-white/40 dark:bg-black/40 backdrop-blur-md">
      <AdminNav email={admin.user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
