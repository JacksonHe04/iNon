'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminSignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    startTransition(() => {
      router.push('/login');
      router.refresh();
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
