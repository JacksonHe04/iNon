'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Modal from '@/components/Modal';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { inonLoginPath, inonLogoutPath } from '@/lib/sso/public-paths';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export default function AuthModal({ open, onClose, userEmail }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleNavigation = () => {
    setLoading(true);
  };

  const returnTo = pathname || '/';

  return (
    <Modal open={open} onClose={onClose} position="center" className="max-w-md p-6">
      {userEmail ? (
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg">
            {userEmail[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">已登录</h3>
            <p className="text-sm text-gray-500 font-mono mt-1">{userEmail}</p>
          </div>

          <a
            href={inonLogoutPath(returnTo)}
            onClick={handleNavigation}
            aria-disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition text-sm font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>退出登录</span>
          </a>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              使用 iNon 账号
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              一次登录即可进入 iNon、Leaf、PINE、SAYLESS 与 Treez。
            </p>
          </div>
          <a
            href={inonLoginPath(returnTo)}
            onClick={handleNavigation}
            aria-disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition text-sm font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>前往 iNon SSO</span>
          </a>
        </div>
      )}
    </Modal>
  );
}
