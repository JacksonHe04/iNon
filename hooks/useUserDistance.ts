import { useState, useCallback, useEffect } from 'react';
import {
  getCityCoordinates,
  getUserLocation,
  calculateDistance,
  resolveCityCoordinates,
} from '@/lib/utils';

export function useUserDistance(currentCity: string) {
  const [distance, setDistance] = useState<number | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [isRefreshingLocation, setIsRefreshingLocation] = useState(false);

  const [cityCoords, setCityCoords] = useState(() => getCityCoordinates(currentCity));

  useEffect(() => {
    let cancelled = false;
    const localCoords = getCityCoordinates(currentCity);
    setCityCoords(localCoords);

    if (localCoords) return;

    void resolveCityCoordinates(currentCity).then((coords) => {
      if (!cancelled) {
        setCityCoords(coords);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [currentCity]);

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
