'use client';

import { motion } from 'framer-motion';
import type { ReadmeData } from '@/types';
import { BookOpen, ExternalLink } from 'lucide-react';

interface ReadingDeskSceneProps {
  books: ReadmeData['reading']['books'];
  onSelect: (detail: {
    title: string;
    description: string;
    link?: string;
    author: string;
    country: string;
  }) => void;
  activeTitle?: string | null;
  mode?: 'readonly' | 'edit';
}

export default function ReadingDeskScene({ books, onSelect, activeTitle, mode = 'readonly' }: ReadingDeskSceneProps) {
  
  if (mode === 'edit') {
    return (
      <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-h-[260px] text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="w-12 h-12 text-teal-500/60 opacity-80" />
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">立体交互式书架 (排版预览)</h4>
          <p className="text-xs text-gray-500">在画板编辑模式下，3D 互动已降级以优化性能。</p>
        </div>
      </div>
    );
  }

  // Take up to 6 books for a balanced bookshelf display
  const featured = books.slice(0, 6);

  // Set of premium spine gradients
  const gradients = [
    'from-indigo-600 to-indigo-800 border-indigo-400/40 text-indigo-100',
    'from-emerald-600 to-emerald-800 border-emerald-400/40 text-emerald-100',
    'from-purple-600 to-purple-800 border-purple-400/40 text-purple-100',
    'from-rose-600 to-rose-800 border-rose-400/40 text-rose-100',
    'from-amber-600 to-amber-800 border-amber-400/40 text-amber-100',
    'from-cyan-600 to-cyan-800 border-cyan-400/40 text-cyan-100',
  ];

  return (
    <div className="relative mt-8 w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl">
      {/* Background soft ambient radial lights */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.05),transparent_40%)]" />

      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-500 font-bold flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reading Shelf</span>
          </p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">立体交互式书架</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">点击书脊抽取书籍，查看作者与书本摘要。</p>
        </div>
      </div>

      {/* Bookshelf Visual container */}
      <div className="relative mt-8 h-[280px] flex items-end justify-center px-4">
        {/* Floating Glass shelf base */}
        <div className="absolute bottom-4 inset-x-2 h-3 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 shadow-[0_10px_20px_rgba(0,0,0,0.15)] backdrop-blur-sm" />
        <div className="absolute bottom-2 inset-x-8 h-2 rounded-full bg-teal-500/10 blur-md" />

        {/* Books container with perspective */}
        <div className="relative flex items-end justify-center gap-3 sm:gap-4 md:gap-5 pb-6 w-full max-w-2xl px-6" style={{ perspective: '800px' }}>
          {featured.map((book, idx) => {
            const isActive = activeTitle === book.name;
            const grad = gradients[idx % gradients.length];
            return (
              <motion.button
                key={book.name}
                className={`group relative flex h-48 w-11 sm:w-14 md:w-16 flex-col items-center justify-between rounded-t-lg border bg-gradient-to-b px-2 py-4 cursor-pointer select-none shadow-[2px_10px_15px_rgba(0,0,0,0.2)] ${grad}`}
                style={{
                  transformStyle: 'preserve-3d',
                  originY: 'bottom',
                }}
                animate={
                  isActive
                    ? { y: -35, rotateY: -15, rotateZ: -1, z: 30, scale: 1.08 }
                    : { y: 0, rotateY: -5 + idx * 2, rotateZ: 0, z: 0, scale: 1 }
                }
                whileHover={
                  !isActive
                    ? { y: -18, rotateY: -12, rotateZ: -2, z: 15, scale: 1.04 }
                    : {}
                }
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onClick={() =>
                  onSelect({
                    title: book.name,
                    description: book.comment,
                    link: book.link,
                    author: book.author,
                    country: book.country,
                  })
                }
              >
                {/* Book Spine Highlight Overlay */}
                <div className="absolute inset-0 rounded-t-lg bg-gradient-to-r from-white/20 via-transparent to-black/10" />

                {/* Ribbon bookmark decoration hanging from top */}
                {idx % 3 === 0 && (
                  <div className="absolute -top-1 w-1.5 h-6 bg-red-500 rounded-b shadow-sm right-2" />
                )}

                {/* Country tag / Origin */}
                <span className="text-[7px] md:text-[8px] font-bold tracking-widest opacity-60 uppercase truncate w-full text-center">
                  {book.country}
                </span>

                {/* Vertical Title Rendering */}
                <div className="flex-1 flex items-center justify-center py-2 min-h-0 w-full">
                  <span 
                    className="text-[9px] sm:text-xs md:text-sm font-extrabold tracking-wider break-all text-center w-full uppercase line-clamp-3 leading-tight"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                    }}
                  >
                    {book.name}
                  </span>
                </div>

                {/* Author Label */}
                <span className="text-[7px] md:text-[8px] font-semibold tracking-wider opacity-75 truncate max-w-full text-center">
                  {book.author}
                </span>

                {/* Active Indicator bar */}
                {isActive && (
                  <motion.div 
                    layoutId="shelfActiveBook"
                    className="absolute -bottom-2.5 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 rounded shadow-glow"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
