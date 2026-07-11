'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReadmeData } from '@/types';
import { Briefcase, Calendar, ChevronRight, Terminal } from 'lucide-react';

interface WorkSceneProps {
  jobs: ReadmeData['work']['jobs'];
  onSelectJob: (job: ReadmeData['work']['jobs'][number]) => void;
  activeJobId?: string;
}

export default function WorkScene({ jobs, onSelectJob, activeJobId }: WorkSceneProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Find index of active job based on company name
  const activeIdx = Math.max(0, jobs.findIndex((j) => j.company_name === activeJobId));
  const activeJob = jobs[activeIdx] ?? jobs[0];

  const handleJobSelect = (job: typeof jobs[number]) => {
    onSelectJob(job);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 dark:bg-black/10 p-6 backdrop-blur-md shadow-2xl">
      {/* Background neon visual glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(16,185,129,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(6,182,212,0.06),transparent_50%)]" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-emerald-500 font-bold flex items-center gap-1.5">
            <Briefcase className="w-4 h-4" />
            <span>Career Timelines</span>
          </p>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">2D 工作职业关卡</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">控制角色滑动闯关各家企业节点，查看对应的核心职责与经历。</p>
        </div>
      </div>

      {/* Main timeline interactive arena */}
      <div className="relative mt-8 min-h-[300px] flex flex-col justify-between pt-16">
        
        {/* Glowing circuit path track */}
        <div className="absolute top-[98px] left-[8%] right-[8%] h-1 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <div className="absolute inset-0 bg-white/10 animate-pulse rounded-full" />
        </div>

        {/* Timeline Checkpoints */}
        <div className="relative flex justify-between items-center px-[8%] w-full">
          {jobs.map((job, idx) => {
            const isActive = activeJobId === job.company_name;
            const levelNum = idx + 1;

            return (
              <div key={`${job.company_name}-${idx}`} className="relative flex flex-col items-center">
                {/* Node stage block button */}
                <motion.button
                  type="button"
                  onClick={() => handleJobSelect(job)}
                  className={`relative z-20 w-11 h-11 rounded-xl border-2 bg-slate-950 cursor-pointer flex flex-col items-center justify-center font-mono font-bold text-[10px] shadow-lg transition-colors ${
                    isActive
                      ? 'border-emerald-400 text-emerald-400 shadow-emerald-500/30'
                      : 'border-white/20 text-white/50 hover:border-white/50 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.15, rotate: [0, -3, 3, 0] }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-[8px] opacity-60">JOB</span>
                  <span>0{levelNum}</span>
                  {/* Glowing pulse ring */}
                  {isActive && (
                    <span className="absolute -inset-1.5 rounded-xl border border-emerald-400/50 animate-ping opacity-45" />
                  )}
                </motion.button>

                {/* Company Name Badge under Node */}
                <span className={`text-[10px] font-bold text-center mt-3 max-w-[90px] truncate select-none ${
                  isActive ? 'text-emerald-500 dark:text-emerald-400 scale-105' : 'text-gray-500'
                }`}>
                  {job.company_name || '未公开'}
                </span>
              </div>
            );
          })}

          {/* Running Character Avatar (Moving along work timeline) */}
          <motion.div
            className="absolute z-30 w-8 h-8 -top-8 flex items-center justify-center text-2xl pointer-events-none select-none"
            animate={{
              left: `calc(8% + ${activeIdx * (84 / (jobs.length - 1))}% - 16px)`,
              // Cute walk bobbing bounce
              y: [0, -6, 0],
            }}
            transition={{
              left: { type: 'spring', stiffness: 200, damping: 22 },
              y: { repeat: Infinity, duration: 1, ease: 'easeInOut' }
            }}
          >
            🏃‍♂️
          </motion.div>
        </div>

        {/* Selected job console details panel */}
        <div className="mt-14 w-full flex justify-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeJob.company_name}
              className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/20 dark:bg-black/35 p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row gap-5 items-start"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Left retro terminal logo */}
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 shadow shadow-black/40">
                <Terminal className="w-6 h-6 animate-pulse" />
              </div>

              {/* Console logs */}
              <div className="flex-1 space-y-2 min-w-0 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 justify-between">
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 w-fit">
                    Checkpoint Cleared
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {activeJob.start_date} ~ {activeJob.end_date}
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <span>{activeJob.company_name}</span>
                    <ChevronRight className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-semibold opacity-75">{activeJob.position}</span>
                  </h4>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{activeJob.position_type}</p>
                </div>

                <div className="p-3 rounded-lg bg-black/10 border border-white/5 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <p className="font-bold text-emerald-500">
                    🎯 核心项目/职责:
                  </p>
                  <p className="opacity-90">{activeJob.products_responsible_for || '负责创意探索与项目开发。'}</p>
                  <p className="font-bold text-teal-400 pt-1">
                    📝 工作纪要:
                  </p>
                  <p className="opacity-75 leading-relaxed">{activeJob.job_summary || '暂无详细纪要'}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>
    </div>
  );
}
