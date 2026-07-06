'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogIn, Loader2 } from 'lucide-react';

type AdminLoginFormProps = {
  nextPath: string;
};

export default function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;

      setMessage({ type: 'success', text: '登录成功，正在跳转...' });
      setTimeout(() => {
        router.push(nextPath);
        router.refresh();
      }, 600);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '登录失败';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md rounded-3xl border border-white/30 bg-white/85 p-8 shadow-2xl backdrop-blur space-y-4"
    >
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">管理员登录</h1>
        <p className="text-xs text-gray-500">
          使用已加入 <code className="font-mono">admin_users</code> 白名单的账号
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
          <label className="block text-xs font-medium text-gray-700 mb-1">邮箱</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        <span>立即登录</span>
      </button>
    </form>
  );
}
