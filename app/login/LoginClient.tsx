'use client';

import { useRouter } from 'next/navigation';
import AuthForm from '@/components/auth/AuthForm';

interface LoginClientProps {
  nextPath: string;
}

export default function LoginClient({ nextPath }: LoginClientProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-md rounded-3xl border border-white/30 bg-white/85 dark:bg-gray-900/80 p-8 shadow-2xl backdrop-blur">
      <AuthForm
        onSuccess={() => {
          setTimeout(() => {
            router.push(nextPath);
            router.refresh();
          }, 600);
        }}
      />
    </div>
  );
}
