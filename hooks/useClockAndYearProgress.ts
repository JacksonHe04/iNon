import { useState, useEffect } from 'react';
import { getCurrentTime, getYearProgress } from '@/lib/utils';

export function useClockAndYearProgress() {
  const [currentTime, setCurrentTime] = useState('');
  const [yearProgress, setYearProgress] = useState({ daysPassed: 0, totalDays: 0, percentage: 0 });
  const [isMounted, setIsMounted] = useState(false);

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

  return {
    currentTime,
    yearProgress,
    isMounted,
  };
}
export default useClockAndYearProgress;
