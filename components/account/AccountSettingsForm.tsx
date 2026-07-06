'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import PasswordResetForm from '@/components/auth/PasswordResetForm';
import { User, Link as LinkIcon, Plus, Trash2, Check, AlertCircle, Loader2, Home } from 'lucide-react';

export default function AccountSettingsForm({ currentUsername }: { currentUsername: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(currentUsername);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const [newSlugInput, setNewSlugInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function loadAccountSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/account/settings');
        if (!res.ok) {
          throw new Error('无法加载账号信息');
        }
        const data = await res.json();
        if (data.username) setUsername(data.username);
        if (data.slugs) setSlugs(data.slugs);
        if (data.email) setEmail(data.email);
      } catch (err: any) {
        setErrorMessage(err.message || '加载账号设置失败');
      } finally {
        setLoading(false);
      }
    }
    loadAccountSettings();
  }, []);

  const handleAddSlug = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSlugInput.trim();
    const lower = val.toLowerCase();

    if (slugs.some((s) => s.toLowerCase() === lower)) {
      setErrorMessage(`Slug "${val || '/'}" 已经存在于你的列表中`);
      return;
    }

    setSlugs([...slugs, val]);
    setNewSlugInput('');
    setErrorMessage('');
  };

  const handleAddRootSlug = () => {
    if (slugs.some((s) => s === '')) {
      setErrorMessage('空 Slug (根路径 /) 已经存在于你的列表中');
      return;
    }
    setSlugs([...slugs, '']);
    setErrorMessage('');
  };

  const handleRemoveSlug = (slugToRemove: string) => {
    setSlugs(slugs.filter((s) => s !== slugToRemove));
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/account/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          slugs,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '保存账号配置失败');
      }

      setSaveStatus('saved');
      setSuccessMessage('账号设置保存成功！');

      setTimeout(() => {
        setSaveStatus('idle');
        setSuccessMessage('');
      }, 3000);

      // If username changed, redirect to new dashboard URL
      if (username && username !== currentUsername) {
        router.push(`/i/${username}`);
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || '网络或系统异常');
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-8 flex items-center justify-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
        <span className="text-sm font-medium">加载账号设置中...</span>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Settings Box */}
      <GlassCard className="p-6 space-y-6 border-white/20">
        <div className="flex items-center justify-between border-b border-white/20 pb-4">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              账号标识与路径 Slug 设置
            </h2>
          </div>
          {email && (
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 border border-teal-500/20">
              {email}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAccount} className="space-y-6">
          {/* Section 1: Username */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              用户名 (Username) <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-xs font-mono text-gray-500 border border-gray-300 dark:border-gray-700">
                /i/
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如: JacksonHe04"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              用户名在系统内全局唯一。可通过 <code className="text-teal-600 dark:text-teal-400">/{username || 'username'}</code> 访问公开页，通过 <code className="text-teal-600 dark:text-teal-400">/i/{username || 'username'}</code> 进入控制台。
            </p>
          </div>

          {/* Section 2: Path Slugs */}
          <div className="space-y-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                路径 Slug 列表 (Path Slugs)
              </label>
              <span className="text-[11px] text-gray-500 font-mono">
                单个用户可绑定多个 Slug，支持空 Slug (代表 <code className="text-teal-600">/</code> 或 <code className="text-teal-600">/i/</code>)
              </span>
            </div>

            {/* Existing Slugs List */}
            <div className="flex flex-wrap gap-2">
              {slugs.map((s, idx) => {
                const isRoot = s === '';
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition shadow-sm ${
                      isRoot
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30'
                    }`}
                  >
                    {isRoot ? (
                      <div className="flex items-center gap-1">
                        <Home className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold">/ (根路径空 Slug)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-3.5 h-3.5 text-teal-500" />
                        <span>/{s}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSlug(s)}
                      className="p-0.5 rounded hover:bg-rose-500/20 text-rose-500 transition"
                      title="移除 Slug"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
              {slugs.length === 0 && (
                <span className="text-xs text-gray-400 italic">暂未绑定额外 Slug</span>
              )}
            </div>

            {/* Add Slug Inline Form */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <input
                type="text"
                value={newSlugInput}
                onChange={(e) => setNewSlugInput(e.target.value)}
                placeholder="输入新 Slug (例如: jackson-he)"
                className="flex-1 px-3.5 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/50 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddSlug}
                className="flex items-center justify-center gap-1 px-4 py-1.5 rounded-xl bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加 Slug</span>
              </button>
              {!slugs.includes('') && (
                <button
                  type="button"
                  onClick={handleAddRootSlug}
                  className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold hover:bg-amber-500/30 transition shadow-sm"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>绑定根路径 (/)</span>
                </button>
              )}
            </div>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Save Button */}
          <div className="flex items-center justify-end pt-2 border-t border-white/20">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold shadow-md hover:opacity-90 transition disabled:opacity-50"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>保存配置中...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>保存成功！</span>
                </>
              ) : (
                <span>保存账号与 Slug 配置</span>
              )}
            </button>
          </div>
        </form>
      </GlassCard>

      {/* Password Reset Section */}
      <PasswordResetForm />
    </div>
  );
}
