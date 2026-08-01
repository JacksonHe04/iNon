'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReadmeData } from '@/types';
import { GraduationCap, MapPin, Calendar, BookOpen } from 'lucide-react';

interface EducationSceneProps {
  schools: ReadmeData['education']['schools'];
  mode?: 'readonly' | 'edit';
}

export default function EducationScene({ schools, mode = 'readonly' }: EducationSceneProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateMatch = () => setIsMobile(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, []);

  const activeSchool = schools[activeIdx] ?? schools[0];

  if (mode === 'edit') {
    return (
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[220px] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <GraduationCap className="w-12 h-12 text-blue-500/60 opacity-80" />
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">教育经历互动场景 (排版预览)</h4>
          <p className="text-xs text-gray-500">在画板编辑模式下，学校互动场景已降级以优化性能。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl">
      {/* Background visual neon glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.06),transparent_50%)]" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500 font-bold flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>Learning Journey</span>
          </p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">2D 学习探险地图</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">点击学校关卡，控制角色跑动“通关”获取学位成就。</p>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative mt-8 min-h-[300px]">
        {isMobile ? (
          /* Mobile layout: simplified vertical list but interactive */
          <div className="flex flex-col gap-4">
            {schools.map((school, idx) => {
              const isActive = activeIdx === idx;
              return (
                <button
                  key={school.institution}
                  onClick={() => setActiveIdx(idx)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 backdrop-blur-sm cursor-pointer ${
                    isActive
                      ? 'bg-blue-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'bg-white/5 border-white/10 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">Level {schools.length - idx}</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/10">{school.start_date.split('-')[0]}</span>
                  </div>
                  <p className="font-bold text-sm mt-1">{school.institution}</p>
                  <p className="text-xs opacity-80">{school.degree} · {school.major}</p>
                  <p className="text-[10px] opacity-60 mt-1">{school.start_date} ~ {school.end_date}</p>
                </button>
              );
            })}
          </div>
        ) : (
          /* Desktop Layout: Horizontal Walkable Game Timeline Map */
          <div className="relative h-full flex flex-col justify-between pt-16">
            {/* Timeline Pathway Track Line */}
            <div className="absolute top-[102px] left-[10%] right-[10%] h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-inner">
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            </div>

            {/* School checkpoints nodes */}
            <div className="relative flex justify-between items-center px-[10%] w-full">
              {schools.map((school, idx) => {
                const isActive = activeIdx === idx;
                const levelNum = schools.length - idx;

                return (
                  <div key={school.institution} className="relative flex flex-col items-center">
                    {/* Node Stage Circle */}
                    <motion.button
                      className={`relative z-20 w-12 h-12 rounded-full border-2 bg-slate-900 cursor-pointer flex items-center justify-center font-bold text-xs shadow-lg transition-colors ${
                        isActive
                          ? 'border-blue-400 text-blue-400 shadow-blue-500/30'
                          : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
                      }`}
                      onClick={() => setActiveIdx(idx)}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      L{levelNum}
                      {/* Active glowing ring */}
                      {isActive && (
                        <span className="absolute -inset-2 rounded-full border border-blue-400/50 animate-ping opacity-45" />
                      )}
                    </motion.button>

                    {/* School Name Tag under Node */}
                    <span className={`text-[10px] font-bold text-center mt-3 max-w-[90px] truncate select-none ${
                      isActive ? 'text-blue-500 dark:text-blue-400 scale-105' : 'text-gray-500'
                    }`}>
                      {school.institution.split('大学')[0] || school.institution}
                    </span>
                  </div>
                );
              })}

              {/* Running / Jumping Avatar (The Playable Character) */}
              <motion.div
                className="absolute z-30 w-10 h-10 -top-8 flex items-center justify-center text-3xl pointer-events-none select-none"
                animate={{
                  // Position avatar horizontally matching the active school node
                  left: `calc(10% + ${activeIdx * (80 / (schools.length - 1))}% - 20px)`,
                  // Cute jumping bounce loop
                  y: [0, -12, 0],
                }}
                transition={{
                  left: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                  y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
                }}
              >
                🎓
              </motion.div>
            </div>

            {/* Stage achievement popup dialog box */}
            <div className="mt-14 w-full flex justify-center px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/20 dark:bg-black/30 p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-center gap-4"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Left big badge */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 border border-white/20 flex items-center justify-center text-white text-3xl shadow shadow-indigo-500/20 shrink-0">
                    🏛️
                  </div>
                  
                  {/* Text details */}
                  <div className="flex-1 text-center md:text-left space-y-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-1.5 justify-center md:justify-start">
                      <span className="text-[10px] font-mono font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20 w-fit mx-auto md:mx-0">
                        Achieved
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-center md:justify-start font-semibold">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        {activeSchool.start_date} ~ {activeSchool.end_date}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {activeSchool.institution}
                    </h4>
                    
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 justify-center md:justify-start">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{activeSchool.degree}</span>
                      <span className="opacity-40">|</span>
                      <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                      <span className="truncate">{activeSchool.major}</span>
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
