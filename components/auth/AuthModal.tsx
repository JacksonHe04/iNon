'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import { createClient } from '@/lib/supabase/client';
import { LogIn, UserPlus, LogOut, Loader2 } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string | null;
}

export default function AuthModal({ open, onClose, userEmail }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '注册成功！请查收邮件完成验证，或直接登录。' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: '登录成功！正在刷新...' });
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '认证操作失败';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {isSignUp ? '注册 iNon 账号' : '登录 iNon'}
            </h3>
            <p className="text-xs text-gray-500">
              {isSignUp ? '创建你的个人 Block-based 操作系统' : '登录后管理你的个人 OS 控制台'}
            </p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl text-xs ${
                message.type === 'error'
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : 'bg-teal-500/10 text-teal-600 border border-teal-500/20'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                邮箱
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                密码
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-500 text-white font-medium text-sm shadow-md hover:bg-teal-600 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSignUp ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{isSignUp ? '注册账户' : '立即登录'}</span>
          </button>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800">
            {isSignUp ? '已有账号？' : '还没有账号？'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage(null);
              }}
              className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              {isSignUp ? '直接登录' : '免费注册'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
