import { useEffect, useState } from 'react';
import { getYearProgress } from '@/lib/utils';

const EMPTY_YEAR_PROGRESS = { daysPassed: 0, totalDays: 0, percentage: 0 };

export function useYearProgress() {
  const [yearProgress, setYearProgress] = useState(EMPTY_YEAR_PROGRESS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const updateAtDayBoundary = () => {
      setYearProgress(getYearProgress());
      setIsMounted(true);

      const nextDay = new Date();
      nextDay.setHours(24, 0, 1, 0);
      timer = setTimeout(updateAtDayBoundary, nextDay.getTime() - Date.now());
    };

    updateAtDayBoundary();
    return () => clearTimeout(timer);
  }, []);

  return { yearProgress, isMounted };
}

export default useYearProgress;
