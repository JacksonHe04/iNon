'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';
import DeepSpaceScene from '../scenes/DeepSpaceScene';

interface DeepWaterSectionProps {
  data: ReadmeData['thoughts'];
}

const SCROLL_UNLOCK_DISTANCE = 1200;

export default function DeepWaterSection({ data }: DeepWaterSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY + window.innerHeight;
      if (scrollTop >= scrollHeight - 120) {
        setIsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setIsInViewport(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('deepwater-visibility', {
        detail: { active: isUnlocked && isInViewport },
      })
    );
  }, [isUnlocked, isInViewport]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(
        new CustomEvent('deepwater-visibility', { detail: { active: false } })
      );
    };
  }, []);

  useEffect(() => {
    if (!isVisible || isUnlocked) return;

    const isNearBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;

    const pushProgress = (delta: number) => {
      if (!delta) return;
      setPullProgress((prev) => {
        const next = Math.max(0, Math.min(1, prev + delta));
        if (next >= 1) {
          setIsUnlocked(true);
          return 1;
        }
        return next;
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isNearBottom()) return;
      pushProgress(event.deltaY / SCROLL_UNLOCK_DISTANCE);
    };

    let lastTouchY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (lastTouchY === null || !isNearBottom()) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const delta = lastTouchY - currentY;
      lastTouchY = currentY;
      if (delta === 0) return;
      pushProgress(delta / (SCROLL_UNLOCK_DISTANCE * 0.7));
    };
    const handleTouchEnd = () => {
      lastTouchY = null;
    };

    const handleReset = () => {
      if (!isNearBottom()) {
        setPullProgress((prev) => (prev > 0 ? Math.max(0, prev - 0.05) : 0));
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('scroll', handleReset);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleReset);
    };
  }, [isVisible, isUnlocked]);

  if (!isVisible) return null;

  const sectionSpacing = 'px-4 sm:px-8 lg:px-16';

  return (
    <section
      id="deepwater"
      ref={sectionRef}
      className={`min-h-screen w-full py-20 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl transition-all duration-500 ${sectionSpacing}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-purple-950 to-black" />

      <div className="relative z-10 space-y-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-bold text-center text-white"
        >
          深水区
        </motion.h2>

        {!isUnlocked ? (
          <div className="flex flex-col items-center gap-6 text-white">
            <p className="text-sm text-white/70 text-center">
              持续向下滑动，穿透更大的阻力以开启深水区
            </p>
            <motion.div
              className="w-full max-w-sm rounded-full border border-white/30 bg-white/10 p-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-teal-400"
                style={{ width: `${pullProgress * 100}%` }}
              />
            </motion.div>
            <p className="text-xs text-white/60">
              当前充能 {Math.round(pullProgress * 100)}%，继续滚动解锁入口
            </p>
          </div>
        ) : (
          <>
            <DeepSpaceScene />
            <div className="w-full space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">个人哲学</h3>
                  <div className="space-y-2">
                    {data.personal_philosophy.map((philosophy, idx) => (
                      <p key={idx} className="text-gray-200">
                        {philosophy}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">行业观点</h3>
                  <div className="space-y-2">
                    {data.industry_views.map((view, idx) => (
                      <p key={idx} className="text-gray-200">
                        {view}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">意识形态</h3>
                  <div className="space-y-2">
                    {data.ideology.map((ideology, idx) => (
                      <p key={idx} className="text-gray-200">
                        {ideology}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">生命元素</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.life_elements.map((element, idx) => (
                      <span key={idx} className="px-4 py-2 bg-white/20 rounded-full text-sm text-white">
                        {element}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">宏观愿景</h3>
                  <div className="space-y-2">
                    {data.macro_vision.map((vision, idx) => (
                      <p key={idx} className="text-gray-200">
                        {vision}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="bg-white/5 backdrop-blur-md">
                  <h3 className="text-2xl font-semibold mb-4 text-white">个人愿景</h3>
                  <div className="space-y-2">
                    {data.personal_vision.map((vision, idx) => (
                      <p key={idx} className="text-gray-200">
                        {vision}
                      </p>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <GlassCard className="bg-white/5 backdrop-blur-md">
                <h3 className="text-2xl font-semibold mb-4 text-white">问答</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.qa.map((qa, idx) => (
                    <div key={idx} className="border-b border-white/20 pb-4 last:border-0 text-white">
                      <h4 className="font-semibold mb-2">{qa.question}</h4>
                      <p className="text-gray-200 mb-2">{qa.answer}</p>
                      <div className="text-xs text-gray-400">
                        {qa.source} · {qa.date}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
