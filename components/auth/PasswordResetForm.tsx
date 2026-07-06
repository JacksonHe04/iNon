'use client';

import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { Lock, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function PasswordResetForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: 'error', text: '两次输入的新密码不一致，请重新检查' });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: 'error', text: '新密码长度至少需要 6 个字符' });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // 1. 获取当前登录的用户
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError || !user || !user.email) {
        throw new Error('未检测到有效的用户登录会话，请先登录');
      }

      // 2. 使用当前密码校验原身份
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        throw new Error('当前密码校验失败，请输入正确的旧密码');
      }

      // 3. 更新为新密码
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus({ type: 'success', text: '密码重置成功！请牢记你的新密码。' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '重置密码失败';
      setStatus({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 max-w-xl space-y-5 border-teal-500/30">
      <div className="flex items-center gap-2.5 border-b border-white/20 pb-4">
        <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-base text-gray-900 dark:text-white">修改账户密码</h3>
          <p className="text-xs text-gray-500">为了保障账号安全，请验证原密码后输入新密码</p>
        </div>
      </div>

      {status && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            status.type === 'error'
              ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}
        >
          {status.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
          )}
          <span>{status.text}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            当前密码 (Old Password)
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="输入你的旧密码"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            新密码 (New Password)
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="输入不少于 6 位的新密码"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            确认新密码 (Confirm New Password)
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入新密码"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-sm shadow-md hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <KeyRound className="w-4 h-4" />
          )}
          <span>确认修改密码</span>
        </button>
      </form>
    </GlassCard>
  );
}
