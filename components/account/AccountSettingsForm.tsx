'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import { User, Check, AlertCircle, KeyRound, Loader2 } from 'lucide-react';
import SlugSettingsManager from './SlugSettingsManager';

interface AccountSettingsFormProps {
  currentUsername: string;
  initialEmail?: string;
  initialSlugs?: string[];
}

export default function AccountSettingsForm({
  currentUsername,
  initialEmail,
  initialSlugs,
}: AccountSettingsFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(!initialEmail);
  const [username, setUsername] = useState(currentUsername);
  const [slugs, setSlugs] = useState<string[]>(initialSlugs || []);
  const [email, setEmail] = useState(initialEmail || '');

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (initialEmail !== undefined) {
      setLoading(false);
      return;
    }
    async function loadAccountSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/account/settings');
        if (!res.ok) {
          throw new Error('无法加载账号信息');
        }
        const payload: unknown = await res.json();
        const data =
          payload && typeof payload === 'object'
            ? (payload as Record<string, unknown>)
            : {};
        if (typeof data.username === 'string') setUsername(data.username);
        if (
          Array.isArray(data.slugs) &&
          data.slugs.every((slug) => typeof slug === 'string')
        ) {
          setSlugs(data.slugs);
        }
        if (typeof data.email === 'string') setEmail(data.email);
      } catch (err: any) {
        setErrorMessage(err.message || '加载账号设置失败');
      } finally {
        setLoading(false);
      }
    }
    loadAccountSettings();
  }, [initialEmail]);

  const handleAddSlug = (newSlug: string) => {
    setSlugs([...slugs, newSlug]);
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
          slugs,
        }),
      });

      const payload: unknown = await res.json();
      const data =
        payload && typeof payload === 'object'
          ? (payload as Record<string, unknown>)
          : {};

      if (!res.ok) {
        throw new Error(
          typeof data.error === 'string'
            ? data.error
            : '保存账号配置失败',
        );
      }

      setSaveStatus('saved');
      setSuccessMessage('账号设置保存成功！');

      setTimeout(() => {
        setSaveStatus('idle');
        setSuccessMessage('');
      }, 3000);

      router.refresh();
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
                value={username}
                readOnly
                placeholder="尚未设置"
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800/70 text-sm font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              这是五个项目共用的全局用户名，只能在 <Link className="text-teal-600 dark:text-teal-400" href="/sso/account">iNon 账号安全</Link> 中修改。
            </p>
          </div>

          {/* Section 2: Path Slugs */}
          <SlugSettingsManager
            slugs={slugs}
            onAddSlug={handleAddSlug}
            onRemoveSlug={handleRemoveSlug}
            onAddRootSlug={handleAddRootSlug}
            onError={(msg) => setErrorMessage(msg)}
          />

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

      <GlassCard className="p-6 space-y-3 border-white/20">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-teal-500" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            iNon 账号安全
          </h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          邮箱、全局用户名、密码、GitHub 绑定和登录设备统一在中央账号页管理。
        </p>
        <Link
          href="/sso/account"
          className="inline-flex items-center rounded-xl border border-teal-500/20 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-500/20 dark:text-teal-300"
        >
          打开 iNon 账号安全
        </Link>
      </GlassCard>
    </div>
  );
}
