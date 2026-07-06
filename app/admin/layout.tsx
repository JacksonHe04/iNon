import type { ReactNode } from 'react';
import { requireAdminPage } from '@/lib/admin/auth';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminPage('/admin');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(220,252,231,0.8),_rgba(240,253,250,0.9))]">
      <AdminNav email={admin.user.email} />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
