'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Film, Play, Disc } from 'lucide-react';

interface FilmDeskSceneProps {
  films: Array<{
    name: string;
    director: string;
    country: string;
    link: string;
    comment: string;
    image_url?: string;
  }>;
  onSelect: (detail: {
    title: string;
    description: string;
    link?: string;
    director: string;
    country: string;
  }) => void;
  activeTitle?: string | null;
  mode?: 'readonly' | 'edit';
}

export default function FilmDeskScene({ films, onSelect, activeTitle, mode = 'readonly' }: FilmDeskSceneProps) {
  const featured = films.slice(0, 4);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (mode === 'edit') {
    return (
      <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[300px] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <Film className="w-12 h-12 text-rose-500/60 opacity-80" />
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">复古黑胶电影墙 (排版预览)</h4>
          <p className="text-xs text-gray-500">在画板编辑模式下，3D 互动已降级以优化性能。</p>
        </div>
      </div>
    );
  }

  // Vivid gradient combinations for vinyl labels
  const labelGradients = [
    'from-rose-500 via-pink-500 to-violet-600',
    'from-cyan-500 via-teal-500 to-emerald-600',
    'from-amber-400 via-orange-500 to-red-600',
    'from-purple-500 via-violet-500 to-indigo-600',
  ];

  return (
    <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl">
      {/* Background soft ambient glowing lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_90%,rgba(244,63,94,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(6,182,212,0.06),transparent_50%)]" />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-rose-500 font-bold flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5" />
            <span>Vinyl Player Wall</span>
          </p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">复古黑胶电影墙</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">选取电影唱片，机械臂将滑动并自动切片播放。</p>
        </div>
      </div>

      {/* Record player deck */}
      <div className="relative mt-8 min-h-[340px] flex flex-col items-center justify-center">
        {/* Playback needle arm mechanic indicator */}
        <div className="absolute right-12 top-4 w-28 h-32 pointer-events-none z-30">
          {/* Tone arm base */}
          <div className="absolute right-4 top-0 w-8 h-8 rounded-full bg-white/10 border border-white/25 shadow flex items-center justify-center backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-200 shadow-inner" />
          </div>
          {/* Stylus needle body */}
          <motion.svg
            className="absolute right-[22px] top-[14px] w-24 h-24 origin-top-right"
            viewBox="0 0 100 100"
            fill="none"
            animate={
              activeTitle 
                ? { rotate: [0, 8, 12, 10] } 
                : { rotate: 0 }
            }
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tone arm rod */}
            <path d="M90,5 L40,80 L20,85" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Needle cartridge */}
            <rect x="12" y="80" width="12" height="8" rx="2" fill="#ef4444" transform="rotate(-15 18 84)" />
          </motion.svg>
        </div>

        {/* Vinyl gallery grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 px-4 w-full">
          {featured.map((film, idx) => {
            const isActive = activeTitle === film.name;
            const isHovered = hoveredIdx === idx;
            const labelGrad = labelGradients[idx % labelGradients.length];

            return (
              <div 
                key={film.name}
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vinyl Record sleeve cover behind the disc */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm z-10">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                  
                  {/* Sleeve design: Movie Title */}
                  <div className="absolute inset-3 border border-white/5 rounded-xl flex flex-col justify-between p-2">
                    <span className="text-[7px] uppercase tracking-widest opacity-40 font-mono">Side A</span>
                    <span className="text-[10px] sm:text-xs font-black truncate max-w-full text-center text-white/80">
                      {film.name}
                    </span>
                    <span className="text-[8px] opacity-50 truncate text-center">
                      Dir. {film.director}
                    </span>
                  </div>

                  {/* Play icon overlay on hover/active */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-20">
                    <Play className="w-6 h-6 text-white opacity-80" />
                  </div>
                </div>

                {/* Sliding Vinyl Disc */}
                <motion.button
                  className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950 shadow-[0_10px_20px_rgba(0,0,0,0.4)] cursor-pointer outline-none border border-black z-0 flex items-center justify-center"
                  animate={
                    isActive
                      ? { y: -30, rotate: 360 }
                      : isHovered
                      ? { y: -20, rotate: 90 }
                      : { y: 0, rotate: 0 }
                  }
                  transition={
                    isActive 
                      ? { rotate: { repeat: Infinity, duration: 8, ease: 'linear' }, y: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                      : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                  }
                  onClick={() =>
                    onSelect({
                      title: film.name,
                      description: film.comment,
                      link: film.link,
                      director: film.director,
                      country: film.country,
                    })
                  }
                >
                  {/* Vinyl Groove texture rings */}
                  <div className="absolute inset-2 rounded-full border border-white/5 opacity-40" />
                  <div className="absolute inset-4 rounded-full border border-white/5 opacity-30" />
                  <div className="absolute inset-6 rounded-full border border-white/5 opacity-20" />
                  <div className="absolute inset-8 rounded-full border border-white/5 opacity-10" />

                  {/* Center paper Label */}
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br ${labelGrad} flex items-center justify-center p-1 border border-black/30 shadow-inner`}>
                    {/* Center spindle hole */}
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-slate-950 border border-white/20 shadow-inner flex items-center justify-center">
                      <Disc className="w-1.5 h-1.5 text-white/40" />
                    </div>
                  </div>
                </motion.button>

                {/* Subtitle bottom label */}
                <span className="text-[10px] sm:text-xs font-semibold text-gray-800 dark:text-gray-200 mt-4 text-center max-w-[120px] truncate">
                  {film.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Audio Wave pulse lines underneath when playing */}
        <AnimatePresence>
          {activeTitle && (
            <motion.div 
              className="flex items-center gap-1.5 mt-8 h-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-rose-500"
                  animate={{ height: [8, 24, 12, 18, 8] }}
                  transition={{
                    duration: 0.8 + i * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
