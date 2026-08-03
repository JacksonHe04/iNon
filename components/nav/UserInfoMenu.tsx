'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Eye,
  Images,
  Loader2,
  LogIn,
  LogOut,
  Settings,
  UserRound,
} from 'lucide-react';
import type { TopNavSession } from './types';
import { inonLogoutPath } from '@/lib/sso/public-paths';

interface UserInfoMenuProps {
  session: TopNavSession | null;
  isConsolePage: boolean;
  isPending: boolean;
  onLogin: () => void;
  onPrimaryAction: () => void;
  onPrimaryPrefetch: () => void;
}

export default function UserInfoMenu({
  session,
  isConsolePage,
  isPending,
  onLogin,
  onPrimaryAction,
  onPrimaryPrefetch,
}: UserInfoMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [open]);

  if (!session) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className="archive-userinfo-trigger flex h-10 items-center gap-2 border border-[var(--archive-line-strong)] px-3 text-[10px] font-mono uppercase tracking-[0.12em] transition hover:bg-white/10"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden lg:inline">登录</span>
      </button>
    );
  }

  const displayName = session.username || session.email.split('@')[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        onMouseEnter={onPrimaryPrefetch}
        onFocus={onPrimaryPrefetch}
        className="archive-userinfo-trigger flex h-10 max-w-52 items-center gap-2 border border-[var(--archive-line-strong)] px-2.5 text-left transition hover:bg-white/10"
      >
        <span className="grid h-6 w-6 shrink-0 place-items-center border border-[var(--archive-line)] font-mono text-[9px] uppercase">
          {displayName.slice(0, 2)}
        </span>
        <span className="hidden min-w-0 lg:block">
          <strong className="block truncate font-serif text-xs font-medium">{displayName}</strong>
          <small className="block truncate font-mono text-[8px] uppercase tracking-[0.1em] text-[var(--archive-muted)]">
            {session.projectRole === 'admin' ? 'Archive keeper' : 'Archive member'}
          </small>
        </span>
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className="archive-userinfo-menu absolute right-0 top-[calc(100%+0.65rem)] w-64 border border-[var(--archive-line-strong)] bg-[var(--archive-forest-surface)] p-2 shadow-[8px_10px_0_rgb(20_35_27_/_0.24)]"
        >
          <div className="border-b border-[var(--archive-line)] px-3 py-2.5">
            <p className="truncate font-serif text-sm">{displayName}</p>
            <p className="truncate font-mono text-[9px] tracking-[0.08em] text-[var(--archive-muted)]">{session.email}</p>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onPrimaryAction();
            }}
            className="archive-userinfo-item"
          >
            {isConsolePage ? <Eye className="h-4 w-4" /> : <UserRound className="h-4 w-4" />}
            {isConsolePage ? '预览公开主页' : '进入个人控制台'}
          </button>

          {session.projectRole === 'admin' ? (
            <Link href="/admin/assets" role="menuitem" className="archive-userinfo-item" onClick={() => setOpen(false)}>
              <Images className="h-4 w-4" />
              资产库
            </Link>
          ) : null}

          <Link href="/sso/account" role="menuitem" className="archive-userinfo-item" onClick={() => setOpen(false)}>
            <Settings className="h-4 w-4" />
            账号中心
          </Link>

          <a href={inonLogoutPath('/')} role="menuitem" className="archive-userinfo-item text-[#e3b0a5]">
            <LogOut className="h-4 w-4" />
            退出登录
          </a>
        </div>
      ) : null}
    </div>
  );
}
