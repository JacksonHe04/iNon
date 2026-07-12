import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import { scrollToElement } from '@/lib/utils';
import type { ReadmeData } from '@/types';

interface NavItem {
  id: string;
  scrollId: string;
  label: string;
}

interface MobilePanelProps {
  open: boolean;
  onClose: () => void;
  data: ReadmeData;
  age: number;
  yearProgress: {
    daysPassed: number;
    totalDays: number;
    percentage: number;
  };
  distance: number | null;
  isRefreshingLocation: boolean;
  updateUserLocation: () => Promise<void>;
  formatDistanceMeters: (meters: number) => string;
  setShowLocationModal: (show: boolean) => void;
  navItems: NavItem[];
}

export function MobilePanel({
  open,
  onClose,
  data,
  age,
  yearProgress,
  distance,
  isRefreshingLocation,
  updateUserLocation,
  formatDistanceMeters,
  setShowLocationModal,
  navItems,
}: MobilePanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm sm:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-[min(24rem,50vw)] max-w-full bg-white/85 backdrop-blur-2xl border-r border-white/40 p-5 flex flex-col gap-6 text-gray-800 sm:hidden"
          >
            <div className="flex items-center justify-between flex-shrink-0">
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
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-xl"
                aria-label="关闭侧边导航"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Container for all panels */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-6 pr-1 -mr-1">
              <div className="space-y-3 text-sm">
                <p className="text-xs uppercase text-gray-400">地点与等级</p>
                <button
                  type="button"
                  onClick={() => {
                    if (distance !== null) {
                      setShowLocationModal(true);
                      onClose();
                    } else {
                      void updateUserLocation();
                    }
                  }}
                  className="w-full text-left rounded-2xl border border-white/40 bg-white/60 px-3 py-2 transition hover:bg-white/80 active:scale-[0.98] cursor-pointer"
                >
                  <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 text-green-500" />
                    {data.life.current_city}
                  </p>
                  {isRefreshingLocation ? (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />
                      计算中...
                    </p>
                  ) : distance !== null ? (
                    <p className="text-xs text-gray-500 mt-1">与你相距约 {formatDistanceMeters(distance)}</p>
                  ) : (
                    <p className="text-xs text-green-600 font-medium mt-1">算算离我多远？</p>
                  )}
                </button>
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

              <div>
                <p className="text-xs uppercase text-gray-400 mb-2">导航</p>
                <div className="flex flex-col gap-2">
                  {navItems.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => {
                        scrollToElement(section.scrollId);
                        onClose();
                      }}
                      className="w-full rounded-xl border border-white/40 bg-white/60 px-3 py-2 text-left text-sm text-gray-700"
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default MobilePanel;
