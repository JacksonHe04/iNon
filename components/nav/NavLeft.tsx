import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import type { ReadmeData } from '@/types';

interface NavLeftProps {
  data: ReadmeData;
  age: number;
  yearProgress: {
    daysPassed: number;
    totalDays: number;
    percentage: number;
  };
  distance: number | null;
  isRefreshingLocation: boolean;
  formatDistanceMeters: (meters: number) => string;
  setShowMobilePanel: (val: boolean) => void;
  setShowLocationModal: (val: boolean) => void;
  setShowLevelModal: (val: boolean) => void;
  updateUserLocation: () => Promise<void>;
  isMounted: boolean;
}

export function NavLeft({
  data,
  age,
  yearProgress,
  distance,
  isRefreshingLocation,
  formatDistanceMeters,
  setShowMobilePanel,
  setShowLocationModal,
  setShowLevelModal,
  updateUserLocation,
  isMounted,
}: NavLeftProps) {
  return (
    <div className="archive-nav-identity flex items-center gap-3">
      <button
        type="button"
        onClick={() => setShowMobilePanel(true)}
        className="sm:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 font-semibold"
        aria-label="打开个人面板"
      >
        {data.basic.name[0]}
      </button>
      <div className="hidden sm:flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/40 bg-white/30 text-gray-700 dark:text-gray-200 font-bold text-sm">
          {data.basic.name[0]}
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, y: -2 }}
          className="hidden sm:flex flex-col text-left text-gray-700 rounded-2xl px-3 py-1.5 bg-white/30 border border-white/40 cursor-pointer"
          onClick={() => {
            if (distance !== null) {
              setShowLocationModal(true);
            } else {
              void updateUserLocation();
            }
          }}
        >
          <span className="flex items-center gap-1 text-xs lg:text-sm font-medium">
            <MapPin className="h-3 w-3 text-green-500" />
            {data.life.current_city}
          </span>
          {isRefreshingLocation ? (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <RefreshCw className="h-2.5 w-2.5 animate-spin text-blue-500" />
              计算中...
            </span>
          ) : distance !== null ? (
            <span className="text-xs text-gray-500">距离约 {formatDistanceMeters(distance)}</span>
          ) : (
            <span className="text-xs text-gray-500/80 hover:text-green-600 transition-colors">算算离我多远？</span>
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
  );
}
export default NavLeft;
