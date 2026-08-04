'use client';

import { useEffect, useRef, useState } from 'react';

export default function useNearViewportActivation(rootMargin = '600px 0px') {
  const targetRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || active) return;
    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin });
    observer.observe(target);
    return () => observer.disconnect();
  }, [active, rootMargin]);

  return { targetRef, active };
}
