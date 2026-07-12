import React from 'react';
import { RefreshCw } from 'lucide-react';
import Modal from '@/components/Modal';

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  currentCity: string;
  cityCoords: { lat: number; lon: number } | null;
  userCoords: { lat: number; lon: number } | null;
  distance: number | null;
  isRefreshingLocation: boolean;
  updateUserLocation: () => Promise<void>;
  formatDistanceMeters: (meters: number) => string;
}

export function LocationModal({
  open,
  onClose,
  currentCity,
  cityCoords,
  userCoords,
  distance,
  isRefreshingLocation,
  updateUserLocation,
  formatDistanceMeters,
}: LocationModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-4 text-sm text-gray-600">
        <div>
          <p className="text-xs uppercase text-gray-400">作者位置</p>
          <p className="text-base text-gray-900">{currentCity}</p>
          <p>
            坐标：{cityCoords ? `${cityCoords.lat.toFixed(3)}, ${cityCoords.lon.toFixed(3)}` : '未知'}
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-gray-400">我的位置</p>
            <button
              type="button"
              onClick={() => void updateUserLocation()}
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
  );
}
export default LocationModal;
