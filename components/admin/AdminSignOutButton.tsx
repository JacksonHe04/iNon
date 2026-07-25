'use client';

import { useTransition } from 'react';

export default function AdminSignOutButton() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      window.location.assign('/api/auth/inon/logout?returnTo=/');
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full bg-gray-900 px-3 py-1.5 text-sm text-white"
      disabled={isPending}
    >
      {isPending ? '退出中...' : '退出'}
    </button>
  );
}
