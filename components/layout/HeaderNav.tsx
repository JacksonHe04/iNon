'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LayoutDashboard, Globe, ShieldCheck, User } from 'lucide-react';
import type { ReadmeData } from '@/types';
import TopNav from '@/components/TopNav';

interface HeaderNavProps {
  data: ReadmeData;
  username?: string;
}

export default function HeaderNav({ data, username = 'yingying' }: HeaderNavProps) {
  const pathname = usePathname();

  const isPublicPage = pathname === '/' || (pathname.startsWith('/') && !pathname.startsWith('/i/') && !pathname.startsWith('/admin'));
  const isDashboardPage = pathname.startsWith('/i/');
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* OS Mode Switcher Sub-Header Bar */}
      <div className="bg-black/60 backdrop-blur-md border-b border-white/10 px-4 py-1.5 flex items-center justify-between text-xs text-white/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-teal-300 tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            iNon OS
          </div>
          <span className="text-white/20">|</span>
          <span className="text-white/60 hidden sm:inline">当前视界: <strong className="text-white">{username}</strong></span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mode Switcher Buttons */}
          <Link
            href={`/${username}`}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all text-xs font-medium ${
              isPublicPage
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>公开主页</span>
          </Link>

          <Link
            href={`/i/${username}`}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all text-xs font-medium ${
              isDashboardPage
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>个人 OS 控制台</span>
          </Link>

          <Link
            href="/admin"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all text-xs font-medium ${
              isAdminPage
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'hover:bg-white/10 text-white/70'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">后台管理</span>
          </Link>
        </div>
      </div>

      {/* Main Top Nav */}
      <div className="relative">
        <TopNav data={data} className="relative bg-white/20 border-b border-white/30 backdrop-blur-[40px]" />
      </div>
    </div>
  );
}
