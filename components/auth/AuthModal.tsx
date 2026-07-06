'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import AuthForm from '@/components/auth/AuthForm';
import { createClient } from '@/lib/supabase/client';
import { LogOut, Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export default function AuthModal({ open, onClose, userEmail }: AuthModalProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.reload();
  };

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

          <button
            onClick={handleSignOut}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition text-sm font-semibold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            <span>退出登录</span>
          </button>
        </div>
      ) : (
        <AuthForm onSuccess={() => setTimeout(() => window.location.reload(), 800)} />
      )}
    </Modal>
  );
}
