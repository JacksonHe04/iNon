'use client';

import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MapPin, RefreshCw, User, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ReadmeData } from '@/types';
import {
  calculateAge,
  getYearProgress,
  getCurrentTime,
  getCityCoordinates,
  getUserLocation,
  calculateDistance,
  scrollToElement,
} from '@/lib/utils';
import Modal from './Modal';
import AuthModal from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';
import { NAV_SECTIONS } from './SideNav';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

interface TopNavProps {
  data: ReadmeData;
  className?: string;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const aiSuggestions = ['MBTI匹配度测试', '星座匹配度测试', '推荐一本书', '最近的创作灵感'];
const platformIconMap = {
  GitHub: GithubIcon,
  Twitter: TwitterIcon,
} as const;

export default function TopNav({ data, className }: TopNavProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [yearProgress, setYearProgress] = useState({ daysPassed: 0, totalDays: 0, percentage: 0 });
  const [distance, setDistance] = useState<number | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [aiState, setAIState] = useState<'closed' | 'docked' | 'floating'>('closed');
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAIInput] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState<'mbti' | 'zodiac' | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [notificationsViewed, setNotificationsViewed] = useState(0);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const notificationsStorageKey = 'yingying-notifications-viewed';

  const age = calculateAge(data.life.birth_date);
  const cityCoords = getCityCoordinates(data.life.current_city);
  const shouldShowBadge = data.notifications.length > notificationsViewed;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const markNotificationsRead = () => {
    if (typeof window === 'undefined') return;
    const latestCount = data.notifications.length;
    setNotificationsViewed(latestCount);
    window.localStorage.setItem(notificationsStorageKey, String(latestCount));
  };

  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(getCurrentTime());
    setYearProgress(getYearProgress());
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setYearProgress(getYearProgress());
    }, 1000);
    return () => clearInterval(timer);
  }, [isMounted]);

  const updateUserLocation = useCallback(async () => {
    if (!cityCoords) return;
    setIsRefreshingLocation(true);
    try {
      const userLoc = await getUserLocation();
      if (userLoc) {
        setUserCoords(userLoc);
        const distKm = calculateDistance(userLoc.lat, userLoc.lon, cityCoords.lat, cityCoords.lon);
        setDistance(Math.round(distKm * 1000));
      } else {
        setUserCoords(null);
        setDistance(null);
      }
    } finally {
      setIsRefreshingLocation(false);
    }
  }, [cityCoords]);

  useEffect(() => {
    updateUserLocation();
  }, [updateUserLocation]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(notificationsStorageKey);
    if (stored) {
      setNotificationsViewed(Number(stored));
    }
  }, [notificationsStorageKey]);

  const formatDistanceMeters = (meters: number) => `${meters.toLocaleString()} 米`;

  const getInputPlaceholder = (mode: 'docked' | 'floating') => {
    if (pendingPrompt === 'mbti') {
      return '请输入你的 MBTI（例如 INFP）';
    }
    if (pendingPrompt === 'zodiac') {
      return '请输入你的星座（例如 天蝎座）';
    }
    return mode === 'docked' ? '输入问题...' : '继续提问...';
  };

  const handleIslandClick = () => {
    setAIState((prev) => {
      if (prev === 'closed') return 'docked';
      if (prev === 'docked') return 'closed';
      return 'closed';
    });
  };

  const handleSend = async (prompt?: string) => {
    const rawInput = prompt ?? aiInput;
    const text = rawInput.trim();
    if (!text) return;

    let finalPrompt = text;
    if (!prompt && pendingPrompt) {
      if (pendingPrompt === 'mbti') {
        const lifeMBTI = data.life.mbti?.life_mbti ?? '未知';
        const workMBTI = data.life.mbti?.work_mbti ?? '未知';
        finalPrompt = `访客的 MBTI 是「${text}」。请结合 Yingying 的 MBTI（生活：${lifeMBTI}，工作：${workMBTI}）分析与访客的匹配度，输出性格契合点与建议。`;
      } else if (pendingPrompt === 'zodiac') {
        const zodiac = data.life.zodiac_sign || '未知';
        finalPrompt = `访客的星座是「${text}」。请结合 Yingying 的星座（${zodiac}）进行星座匹配度解析，写出共鸣点与提醒。`;
      }
      setPendingPrompt(null);
    } else if (prompt) {
      setPendingPrompt(null);
    }

    const nextMessages = [...messages, { role: 'user' as const, content: finalPrompt }];
    setMessages([...nextMessages, { role: 'assistant', content: '' }]);
    setAIInput('');
    setAIState('floating');
    setIsStreaming(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error('AI 服务不可用');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantReply = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantReply += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          if (!prev.length) return prev;
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === 'assistant') {
            updated[lastIndex] = { ...updated[lastIndex], content: assistantReply };
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('AI assistant error:', error);
      setErrorMessage('小缨缨暂时离线，请稍后重试。');
      setMessages((prev) => {
        if (!prev.length) return prev;
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: '抱歉，我现在无法连接大脑，请稍后再试。',
          };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSuggestionClick = (suggest: string) => {
    if (suggest.includes('MBTI')) {
      setPendingPrompt('mbti');
      setAIInput('');
      setAIState('docked');
      return;
    }
    if (suggest.includes('星座')) {
      setPendingPrompt('zodiac');
      setAIInput('');
      setAIState('docked');
      return;
    }
    setPendingPrompt(null);
    void handleSend(suggest);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (!isStreaming) {
      void handleSend();
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={className || "fixed top-0 left-0 right-0 z-50 bg-white/20 border-b border-white/30 backdrop-blur-[40px]"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 lg:h-16">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowMobilePanel(true)}
                className="sm:hidden w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-400 text-white font-semibold"
                aria-label="打开个人面板"
              >
                {data.basic.name[0]}
              </button>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center text-white font-bold text-sm lg:text-base">
                  {data.basic.name[0]}
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="hidden sm:flex flex-col text-left text-gray-700 rounded-2xl px-3 py-1.5 bg-white/30 border border-white/40"
                  onClick={() => setShowLocationModal(true)}
                >
                  <span className="flex items-center gap-1 text-xs lg:text-sm font-medium">
                    <MapPin className="h-3 w-3 text-green-500" />
                    {data.life.current_city}
                  </span>
                  {distance !== null && (
                    <span className="text-xs text-gray-500">距离约 {formatDistanceMeters(distance)}</span>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="hidden md:flex flex-col text-left text-gray-700 rounded-2xl px-3 py-1.5 bg-white/30 border border-white/40"
                  onClick={() => setShowLevelModal(true)}
                >
                  <span className="flex items-center gap-2 text-xs lg:text-sm font-medium">
                    Lv.{age}
                    <span className="text-[10px] text-gray-500">
                      {isMounted ? `${yearProgress.daysPassed}/${yearProgress.totalDays}` : ''}
                    </span>
                  </span>
                  <div className="w-28 lg:w-32 h-1.5 bg-gray-200/80 rounded-full overflow-hidden mt-1">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                      initial={{ width: 0 }}
                      animate={{ width: isMounted ? `${yearProgress.percentage}%` : '0%' }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </motion.button>
              </div>
            </div>

            <motion.div
              className="flex-shrink-0 absolute inset-x-0 flex justify-center pointer-events-none sm:pointer-events-auto sm:static sm:w-auto sm:flex-none"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              onClick={handleIslandClick}
            >
              <motion.div
                className="px-6 py-2 rounded-full border border-white/20 bg-black text-white/90 backdrop-blur-2xl cursor-pointer shadow-[0_15px_35px_rgba(0,0,0,0.35)] pointer-events-auto"
                animate={{
                  scale: isHovered || aiState !== 'closed' ? 1.08 : 1,
                  boxShadow:
                    aiState !== 'closed'
                      ? '0 10px 40px rgba(139,92,246,0.35)'
                      : '0 10px 20px rgba(0,0,0,0.08)',
                }}
                transition={{ type: 'spring', stiffness: 260 }}
              >
                <div className="flex items-center gap-2">
                  <div className="relative flex h-4 w-7 items-center justify-center rounded-full bg-white/20">
                    <motion.span
                      className="h-2 w-2 rounded-full bg-white"
                      animate={{ scaleY: [1, 0.2, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                  <span className="text-xs tracking-wide uppercase">小缨缨 AI</span>
                </div>
              </motion.div>

              <AnimatePresence>
                {aiState === 'docked' && (
                  <motion.div
                    layoutId="ai-panel"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 12, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className="absolute left-1/2 top-full z-50 mt-4 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 rounded-3xl border border-white/40 bg-white/60 p-4 text-sm shadow-2xl backdrop-blur-2xl sm:w-80 sm:max-w-none pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="mb-3 text-gray-600">
                      你好，我是小缨缨。想了解 Yingying 的哪些故事？
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {aiSuggestions.map((suggest) => (
                        <button
                          key={suggest}
                          className="rounded-full border border-white/50 bg-white/30 px-3 py-1 text-xs text-gray-600 hover:bg-white/60"
                          onClick={() => handleSuggestionClick(suggest)}
                        >
                          {suggest}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiInput}
                        onChange={(e) => setAIInput(e.target.value)}
                        onKeyDown={handleInputKeyDown}
                        placeholder={getInputPlaceholder('docked')}
                        className="flex-1 rounded-2xl border border-white/50 bg-white/40 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (!isStreaming) void handleSend();
                        }}
                        className="rounded-2xl bg-gradient-to-r from-green-500 to-teal-400 px-4 py-2 text-white text-sm disabled:opacity-50"
                        disabled={isStreaming}
                      >
                        发送
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden lg:flex items-center gap-2">
                {data.contact.platform_accounts.map((platform) => {
                  const Icon =
                    platformIconMap[platform.platform_name as keyof typeof platformIconMap];
                  return (
                    <a
                      key={platform.platform_name}
                      href={platform.homepage_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 transition hover:border-purple-200 hover:text-purple-600"
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-semibold">
                          {platform.platform_name.slice(0, 1)}
                        </span>
                      )}
                    </a>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setShowNotifications((prev) => {
                    const next = !prev;
                    if (next) {
                      markNotificationsRead();
                    }
                    return next;
                  });
                }}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 transition hover:border-purple-200 hover:text-purple-600"
                aria-label="查看通知"
              >
                <Bell className="h-4 w-4" />
                {shouldShowBadge && (
                  <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-4 px-1 bg-gray-100 text-gray-700 rounded-full text-[10px] flex items-center justify-center font-semibold">
                    {data.notifications.length}
                  </span>
                )}
              </button>

              {/* Theme Switcher Button */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 transition hover:border-teal-300 hover:text-teal-500"
                aria-label="切换主题"
                title="切换暗黑/亮色主题"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </button>

              <div className="hidden md:block text-xs lg:text-sm font-mono">{isMounted ? currentTime : ''}</div>

              {/* UserInfo Button */}
              {userEmail ? (
                <button
                  onClick={() => {
                    const name = userEmail.split('@')[0];
                    router.push(`/i/${name}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 to-emerald-500/20 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-medium text-xs hover:scale-105 transition shadow-sm"
                  title="进入我的个人 OS 控制台"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="max-w-[80px] lg:max-w-[120px] truncate">{userEmail.split('@')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 hover:bg-white/60 border border-white/50 text-gray-700 font-semibold text-xs transition shadow-sm"
                >
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>登录</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} userEmail={userEmail} />

      <Modal open={showNotifications} onClose={() => setShowNotifications(false)} position="top-right" className="max-w-sm">
        <h3 className="font-bold mb-2 text-gray-900">通知</h3>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {data.notifications.map((notif, idx) => (
            <div key={idx} className="text-sm border-b border-gray-200 pb-2 last:border-0">
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">{notif.date}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-100 rounded text-blue-700">{notif.type}</span>
              </div>
              <p className="mt-1 text-gray-700">{notif.text}</p>
            </div>
          ))}
        </div>
      </Modal>

      {/* AI 浮窗 */}
      <AnimatePresence>
        {aiState === 'floating' && (
          <motion.div
            layoutId="ai-panel"
            initial={{ opacity: 0, x: 60, y: 60 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 lg:bottom-8 lg:right-8 w-[calc(100vw-2rem)] max-w-md h-[28rem] bg-white/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/40 flex flex-col z-40"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/50">
              <div>
                <p className="text-sm font-semibold">小缨缨 AI</p>
                <p className="text-xs text-gray-500">基于 Yingying 的数字花园</p>
              </div>
              <div className="flex items-center gap-2">
                {isStreaming && <span className="text-[10px] text-green-500">回答中...</span>}
                <button
                  onClick={() => setAIState('closed')}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="rounded-2xl bg-white/50 p-4 text-sm text-gray-600 shadow-inner">
                  你可以问“小缨缨”关于作品、经历、音乐、阅读或任何和 Yingying 相关的故事。
                </div>
              )}
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-green-500 to-teal-400 text-white'
                        : 'bg-white/80 text-gray-800 shadow'
                    }`}
                  >
                    {message.content || (message.role === 'assistant' ? '......' : '')}
                  </div>
                </div>
              ))}
              {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
            </div>
            <div className="border-t border-white/50 px-5 py-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAIInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={getInputPlaceholder('floating')}
                  className="flex-1 rounded-2xl border border-white/50 bg-white/60 px-3 py-2 text-sm focus:border-green-400 focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (!isStreaming) void handleSend();
                  }}
                  className="rounded-2xl bg-gradient-to-r from-green-500 to-teal-400 px-4 py-2 text-white text-sm disabled:opacity-50"
                  disabled={isStreaming}
                >
                  发送
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal open={showLocationModal} onClose={() => setShowLocationModal(false)}>
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <p className="text-xs uppercase text-gray-400">作者位置</p>
            <p className="text-base text-gray-900">{data.life.current_city}</p>
            <p>
              坐标：{cityCoords ? `${cityCoords.lat.toFixed(3)}, ${cityCoords.lon.toFixed(3)}` : '未知'}
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase text-gray-400">我的位置</p>
              <button
                type="button"
                onClick={() => updateUserLocation()}
                disabled={!cityCoords || isRefreshingLocation}
                className="rounded-full p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="刷新我的位置"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshingLocation ? 'animate-spin text-blue-500' : ''}`}
                />
              </button>
            </div>
            {userCoords ? (
              <>
                <p>
                  坐标：{userCoords.lat.toFixed(3)}, {userCoords.lon.toFixed(3)}
                </p>
                {distance !== null && (
                  <p className="mt-1 text-blue-500">与作者相距 {formatDistanceMeters(distance)}</p>
                )}
              </>
            ) : (
              <p>需要权限才能获取你的位置。</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={showLevelModal} onClose={() => setShowLevelModal(false)}>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">出生日期</p>
              <p className="text-lg font-semibold text-gray-900">{data.life.birth_date}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">当前年龄</p>
              <p className="text-lg font-semibold text-gray-900">{age} 岁</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">
              今年 {yearProgress.totalDays} 天 · 已度过 {yearProgress.daysPassed} 天
            </p>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${yearProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </Modal>

      <AnimatePresence>
        {showMobilePanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm sm:hidden"
              onClick={() => setShowMobilePanel(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[min(24rem,50vw)] max-w-full bg-white/85 backdrop-blur-2xl border-r border-white/40 p-5 flex flex-col gap-6 text-gray-800 sm:hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-400 text-white font-semibold flex items-center justify-center">
                    {data.basic.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{data.basic.name}</p>
                    <p className="text-xs text-gray-500">{data.basic.intro}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobilePanel(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  aria-label="关闭侧边导航"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <p className="text-xs uppercase text-gray-400">地点与等级</p>
                <div className="rounded-2xl border border-white/40 bg-white/60 px-3 py-2">
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    {data.life.current_city}
                  </p>
                  {distance !== null && (
                    <p className="text-xs text-gray-500 mt-1">与你相距约 {formatDistanceMeters(distance)}</p>
                  )}
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/60 px-3 py-2">
                  <p className="text-sm font-medium">Lv.{age}</p>
                  <p className="text-xs text-gray-500 mb-1">
                    {yearProgress.daysPassed}/{yearProgress.totalDays}
                  </p>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                      style={{ width: `${yearProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-400 mb-1">社交平台</p>
                <div className="space-y-2 text-sm">
                  {data.contact.platform_accounts.map((platform) => (
                    <a
                      key={platform.platform_name}
                      href={platform.homepage_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-gray-700"
                    >
                      <span>{platform.platform_name}</span>
                      <span className="text-xs text-gray-500">{platform.username}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <p className="text-xs uppercase text-gray-400 mb-2">导航</p>
                <div className="flex flex-col gap-2">
                  {NAV_SECTIONS.map((section: { id: string; label: string }) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToElement(section.id);
                        setShowMobilePanel(false);
                      }}
                      className="w-full rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-left text-sm text-gray-700"
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aiState === 'docked' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-white/30 backdrop-blur-sm"
            onClick={() => setAIState('closed')}
          />
        )}
      </AnimatePresence>
    </>
  );
}
