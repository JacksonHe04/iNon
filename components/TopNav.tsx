'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { ReadmeData } from '@/types';
import { calculateAge, getAuthorNickname } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import type { BlockConfig } from '@/types/layout';
import { getBlockTitle } from '@/lib/blocks/registry';

import useClockAndYearProgress from '@/hooks/useClockAndYearProgress';
import useUserDistance from '@/hooks/useUserDistance';
import useAIAssistant from '@/hooks/useAIAssistant';
import NavLeft from './nav/NavLeft';
import NavMiddle from './nav/NavMiddle';
import NavRight from './nav/NavRight';
import NavModals from './nav/NavModals';
import FloatingAIPanel from './nav/FloatingAIPanel';

interface TopNavProps {
  data: ReadmeData;
  className?: string;
  blocks?: BlockConfig[];
}

export default function TopNav({ data, className, blocks }: TopNavProps) {
  const navItems = blocks && blocks.length > 0
    ? blocks
        .filter((block) => block.visible)
        .map((block) => ({
          id: block.id,
          scrollId: block.sectionId || block.id,
          label: getBlockTitle(block.blockType),
        }))
    : [];
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const { theme, setTheme } = useTheme();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    handleSuggestionClick,
    handleInputKeyDown,
    getInputPlaceholder,
  } = useAIAssistant({ data });

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

  const isConsolePage = pathname?.startsWith('/i/') ?? false;

  const handlePrefetch = useCallback(() => {
    if (userEmail) {
      const name = userEmail.split('@')[0];
      const targetPath = isConsolePage ? `/${name}` : `/i/${name}`;
      router.prefetch(targetPath);
    }
  }, [userEmail, isConsolePage, router]);

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
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={className || "fixed top-0 left-0 right-0 z-50 bg-white/20 border-b border-white/30 backdrop-blur-[40px]"}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-14 lg:h-16">
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

            <NavMiddle
              aiState={aiState}
              setAIState={setAIState}
              messages={messages}
              aiInput={aiInput}
              setAIInput={setAIInput}
              isStreaming={isStreaming}
              errorMessage={errorMessage}
              handleSend={handleSend}
              handleSuggestionClick={handleSuggestionClick}
              handleInputKeyDown={handleInputKeyDown}
              getInputPlaceholder={getInputPlaceholder}
              nickname={nickname}
            />

            <NavRight
              data={data}
              userEmail={userEmail}
              shouldShowBadge={shouldShowBadge}
              isMounted={isMounted}
              currentTime={currentTime}
              isConsolePage={isConsolePage}
              isPending={isPending}
              theme={theme}
              setTheme={setTheme}
              setShowNotifications={setShowNotifications}
              markNotificationsRead={markNotificationsRead}
              handlePrefetch={handlePrefetch}
              setShowAuthModal={setShowAuthModal}
              startTransition={startTransition}
              router={router}
            />
          </div>
        </div>
      </motion.nav>

      <NavModals
        data={data}
        userEmail={userEmail}
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
