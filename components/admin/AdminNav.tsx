'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AdminSignOutButton from './AdminSignOutButton';

const navItems = [
  { href: '/admin/assets', label: '资产库 (对象存储)' },
];

type AdminNavProps = {
  email?: string;
};

export default function AdminNav({ email }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-white/30 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/assets" className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            iNon 后台管理
          </Link>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'bg-white/70 text-gray-600 hover:bg-white hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-600">
          {email && <span className="hidden sm:inline font-mono">{email}</span>}
          <AdminSignOutButton />
        </div>
      </div>
    </div>
  );
}
