import { useEffect, useState } from 'react';
import { getCurrentTime } from '@/lib/utils';

export default function CurrentTime() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const alignTimer = setTimeout(() => {
      setCurrentTime(getCurrentTime());
      interval = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
    }, 1000 - (Date.now() % 1000));

    setCurrentTime(getCurrentTime());
    return () => {
      clearTimeout(alignTimer);
      clearInterval(interval);
    };
  }, []);

  return <div className="hidden md:block text-xs lg:text-sm font-mono">{currentTime}</div>;
}
