import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import NotificationsModal from './NotificationsModal';
import LocationModal from './LocationModal';
import LevelModal from './LevelModal';
import MobilePanel from './MobilePanel';
import type { ReadmeData } from '@/types';

interface NavModalsProps {
  data: ReadmeData;
  userEmail: string | null;
  age: number;
  yearProgress: {
    daysPassed: number;
    totalDays: number;
    percentage: number;
  };
  distance: number | null;
  cityCoords: { lat: number; lon: number } | null;
  userCoords: { lat: number; lon: number } | null;
  isRefreshingLocation: boolean;
  updateUserLocation: () => Promise<void>;
  formatDistanceMeters: (meters: number) => string;
  navItems: Array<{ id: string; label: string }>;

  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (open: boolean) => void;
  showLocationModal: boolean;
  setShowLocationModal: (open: boolean) => void;
  showLevelModal: boolean;
  setShowLevelModal: (open: boolean) => void;
  showMobilePanel: boolean;
  setShowMobilePanel: (open: boolean) => void;

  aiState: 'closed' | 'docked' | 'floating';
  setAIState: (state: 'closed' | 'docked' | 'floating') => void;
}

export function NavModals({
  data,
  userEmail,
  age,
  yearProgress,
  distance,
  cityCoords,
  userCoords,
  isRefreshingLocation,
  updateUserLocation,
  formatDistanceMeters,
  navItems,

  showAuthModal,
  setShowAuthModal,
  showNotifications,
  setShowNotifications,
  showLocationModal,
  setShowLocationModal,
  showLevelModal,
  setShowLevelModal,
  showMobilePanel,
  setShowMobilePanel,

  aiState,
  setAIState,
}: NavModalsProps) {
  return (
    <>
      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} userEmail={userEmail} />

      <NotificationsModal
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={data.notifications}
      />

      <LocationModal
        open={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentCity={data.life.current_city}
        cityCoords={cityCoords}
        userCoords={userCoords}
        distance={distance}
        isRefreshingLocation={isRefreshingLocation}
        updateUserLocation={updateUserLocation}
        formatDistanceMeters={formatDistanceMeters}
      />

      <LevelModal
        open={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        birthDate={data.life.birth_date}
        age={age}
        yearProgress={yearProgress}
      />

      <MobilePanel
        open={showMobilePanel}
        onClose={() => setShowMobilePanel(false)}
        data={data}
        age={age}
        yearProgress={yearProgress}
        distance={distance}
        isRefreshingLocation={isRefreshingLocation}
        updateUserLocation={updateUserLocation}
        formatDistanceMeters={formatDistanceMeters}
        setShowLocationModal={setShowLocationModal}
        navItems={navItems}
      />

      <AnimatePresence>
        {aiState === 'docked' && (
          <div
            className="fixed inset-0 z-30 bg-white/30 backdrop-blur-sm"
            onClick={() => setAIState('closed')}
          />
        )}
      </AnimatePresence>
    </>
  );
}
export default NavModals;
