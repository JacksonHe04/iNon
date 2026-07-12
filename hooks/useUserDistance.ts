import { useState, useCallback } from 'react';
import {
  getCityCoordinates,
  getUserLocation,
  calculateDistance,
} from '@/lib/utils';

export function useUserDistance(currentCity: string) {
  const [distance, setDistance] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const cityCoords = getCityCoordinates(currentCity);

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

  const formatDistanceMeters = (meters: number) => `${meters.toLocaleString()} 米`;

  return {
    distance,
    userCoords,
    cityCoords,
    isRefreshingLocation,
    updateUserLocation,
    formatDistanceMeters,
  };
}
export default useUserDistance;
