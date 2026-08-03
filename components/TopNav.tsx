'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { ReadmeData } from '@/types';
import { calculateAge, getAuthorNickname } from '@/lib/utils';
import type { BlockConfig } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';
import { APP_EVENTS, addAppEventListener } from '@/lib/dom-events';

import useClockAndYearProgress from '@/hooks/useClockAndYearProgress';
import useUserDistance from '@/hooks/useUserDistance';
import useAIAssistant from '@/hooks/useAIAssistant';
import NavLeft from './nav/NavLeft';
import NavRight from './nav/NavRight';
import NavModals from './nav/NavModals';
import FloatingAIPanel from './nav/FloatingAIPanel';
import type { TopNavSession } from './nav/types';
import WorldModeSwitch from './world/WorldModeSwitch';
import { useUniversalTopNav } from './nav/useUniversalTopNav';

interface TopNavProps {
  data: ReadmeData;
  className?: string;
  blocks?: BlockConfig[];
  publicPath?: string;
}

function readTopNavSession(payload: unknown): TopNavSession | null {
  if (!payload || typeof payload !== 'object' || !('session' in payload)) {
    return null;
  }

  const session = payload.session;
  if (!session || typeof session !== 'object') {
    return null;
  }

  const email = 'email' in session ? session.email : null;
  const username = 'username' in session ? session.username : null;
  const projectRole = 'projectRole' in session ? session.projectRole : null;

  if (typeof email !== 'string') {
    return null;
  }

  return {
    email,
    username: typeof username === 'string' ? username : null,
    projectRole: projectRole === 'admin' ? 'admin' : 'member',
  };
}

export default function TopNav({ data, className, blocks, publicPath = '/' }: TopNavProps) {
  const navItems = blocks && blocks.length > 0
    ? blocks
        .filter((block) => block.visible)
        .map((block) => ({
          id: block.id,
          scrollId: block.sectionId || block.id,
          label: getBlockTitle(block.blockType),
        }))
    : [];
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const experience = useUniversalTopNav((state) => state.experience);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [session, setSession] = useState<TopNavSession | null>(null);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [notificationsViewed, setNotificationsViewed] = useState(0);

  const nickname = getAuthorNickname(data.basic.name);
  const notificationsStorageKey = `inon-notifications-viewed-${nickname}`;

  const age = calculateAge(data.life.birth_date);
  const shouldShowBadge = data.notifications.length > notificationsViewed;

  const { currentTime, yearProgress, isMounted } = useClockAndYearProgress();
  const {
    distance,
    userCoords,
    cityCoords,
    isRefreshingLocation,
    updateUserLocation,
    formatDistanceMeters,
  } = useUserDistance(data.life.current_city);

  const {
    aiState,
    setAIState,
    messages,
    aiInput,
    setAIInput,
    isStreaming,
    errorMessage,
    handleSend,
    handleInputKeyDown,
    getInputPlaceholder,
  } = useAIAssistant({ data });

  const handleExperienceModeChange = (mode: 'world' | 'archive' | 'dialogue') => {
    if (experience) {
      experience.onModeChange(mode);
      const url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      window.history.replaceState(window.history.state, '', url);
      return;
    }

    const separator = publicPath.includes('?') ? '&' : '?';
    router.push(`${publicPath}${separator}mode=${mode}`);
  };

  useEffect(() => {
    const handleOpenAIPanel = () => setAIState('floating');
    return addAppEventListener(APP_EVENTS.openAiPanel, handleOpenAIPanel);
  }, [setAIState]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/auth/inon/session', {
      cache: 'no-store',
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response): Promise<unknown> =>
        response.ok ? response.json() : null,
      )
      .then((payload) => {
        setSession(readTopNavSession(payload));
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  const markNotificationsRead = () => {
    if (typeof window === 'undefined') return;
    const latestCount = data.notifications.length;
    setNotificationsViewed(latestCount);
    window.localStorage.setItem(notificationsStorageKey, String(latestCount));
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(notificationsStorageKey);
    if (stored) {
      setNotificationsViewed(Number(stored));
    }
  }, [notificationsStorageKey]);

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={className || "fixed top-0 left-0 right-0 z-50 border-b border-[var(--archive-line-strong)] bg-[rgb(var(--archive-paper-rgb)/0.96)] archive-top-nav"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="archive-nav-row relative flex items-center justify-between h-14 lg:h-16">
            <NavLeft
              data={data}
              age={age}
              yearProgress={yearProgress}
              distance={distance}
              isRefreshingLocation={isRefreshingLocation}
              formatDistanceMeters={formatDistanceMeters}
              setShowMobilePanel={setShowMobilePanel}
              setShowLocationModal={setShowLocationModal}
              setShowLevelModal={setShowLevelModal}
              updateUserLocation={updateUserLocation}
              isMounted={isMounted}
            />

            <WorldModeSwitch
              mode={experience?.mode ?? 'archive'}
              onChange={handleExperienceModeChange}
            />

            <NavRight
              data={data}
              session={session}
              shouldShowBadge={shouldShowBadge}
              isMounted={isMounted}
              currentTime={currentTime}
              theme={theme}
              setTheme={setTheme}
              setShowNotifications={setShowNotifications}
              markNotificationsRead={markNotificationsRead}
              setShowAuthModal={setShowAuthModal}
            />
          </div>
        </div>
      </motion.nav>

      <NavModals
        data={data}
        userEmail={session?.email ?? null}
        age={age}
        yearProgress={yearProgress}
        distance={distance}
        cityCoords={cityCoords}
        userCoords={userCoords}
        isRefreshingLocation={isRefreshingLocation}
        updateUserLocation={updateUserLocation}
        formatDistanceMeters={formatDistanceMeters}
        navItems={navItems}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        showLocationModal={showLocationModal}
        setShowLocationModal={setShowLocationModal}
        showLevelModal={showLevelModal}
        setShowLevelModal={setShowLevelModal}
        showMobilePanel={showMobilePanel}
        setShowMobilePanel={setShowMobilePanel}
        aiState={aiState}
        setAIState={setAIState}
      />

      <FloatingAIPanel
        aiState={aiState}
        setAIState={setAIState}
        messages={messages}
        aiInput={aiInput}
        setAIInput={setAIInput}
        isStreaming={isStreaming}
        errorMessage={errorMessage}
        handleSend={handleSend}
        handleInputKeyDown={handleInputKeyDown}
        getInputPlaceholder={getInputPlaceholder}
        nickname={nickname}
      />
    </>
  );
}
