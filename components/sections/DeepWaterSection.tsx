'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ReadmeData } from '@/types';
import GlassCard from '../GlassCard';

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
      className={`archive-deepwater min-h-screen w-full py-20 relative overflow-hidden border border-[var(--archive-line-strong)] transition-all duration-500 ${sectionSpacing}`}
    >
      <div className="archive-deepwater__landscape absolute inset-0" />

      <div className="relative z-10 space-y-10">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-medium tracking-[-0.045em] text-center text-[#f3efe2]"
        >
          深水区
        </motion.h2>
        <p className="archive-kicker text-center !text-[#d8caa7]">Restricted thoughts · pull to unseal</p>

        {!isUnlocked ? (
          <div className="flex flex-col items-center gap-6 text-[#e9e1cc]">
            <p className="text-sm text-[#d8caa7] text-center">
              持续向下滑动，穿透更大的阻力以开启深水区
            </p>
            <motion.div
              className="w-full max-w-sm border border-[#d8caa7]/50 bg-[#182119]/40 p-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="h-2 bg-[#b58a43]"
                style={{ width: `${pullProgress * 100}%` }}
              />
            </motion.div>
            <p className="text-xs font-mono text-[#d8caa7]">
              当前充能 {Math.round(pullProgress * 100)}%，继续滚动解锁入口
            </p>
          </div>
        ) : (
          <>
            <div className="archive-deepwater__unsealed">
              <span>UNSEALED</span>
              <p>以下内容来自档案中更私人、更深处的思想记录。</p>
            </div>
            <div className="w-full space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">个人哲学</h3>
                  <div className="space-y-2">
                    {data.personal_philosophy.map((philosophy, idx) => (
                      <p key={idx} className="text-gray-700">
                        {philosophy}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">行业观点</h3>
                  <div className="space-y-2">
                    {data.industry_views.map((view, idx) => (
                      <p key={idx} className="text-gray-700">
                        {view}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">意识形态</h3>
                  <div className="space-y-2">
                    {data.ideology.map((ideology, idx) => (
                      <p key={idx} className="text-gray-700">
                        {ideology}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">生命元素</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.life_elements.map((element, idx) => (
                      <span key={idx} className="px-4 py-2 border border-[var(--archive-line)] text-sm text-gray-700">
                        {element}
                      </span>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">宏观愿景</h3>
                  <div className="space-y-2">
                    {data.macro_vision.map((vision, idx) => (
                      <p key={idx} className="text-gray-700">
                        {vision}
                      </p>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900">个人愿景</h3>
                  <div className="space-y-2">
                    {data.personal_vision.map((vision, idx) => (
                      <p key={idx} className="text-gray-700">
                        {vision}
                      </p>
                    ))}
                  </div>
                </GlassCard>
              </div>

              <GlassCard>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">问答</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {data.qa.map((qa, idx) => (
                    <div key={idx} className="border-b border-[var(--archive-line)] pb-4 last:border-0 text-gray-900">
                      <h4 className="font-semibold mb-2">{qa.question}</h4>
                      <p className="text-gray-700 mb-2">{qa.answer}</p>
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
