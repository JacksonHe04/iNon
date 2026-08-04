'use client';

import { useState, Fragment } from 'react';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { Briefcase, ChevronRight, MapPin, Eye, EyeOff } from 'lucide-react';
import useNearViewportActivation from '@/hooks/useNearViewportActivation';

const WorkScene = dynamic(() => import('@/components/scenes/WorkScene'), {
  ssr: false,
  loading: () => <div className="min-h-[300px]" aria-hidden="true" />,
});

export interface JobItem {
  company_name: string;
  position: string;
  position_type: string;
  start_date: string;
  end_date: string;
  products_responsible_for: string;
  job_summary: string;
  work_output: string;
}

interface WorkBlockProps {
  currentJob: string;
  jobs: JobItem[];
  workPreferences: string[];
  title?: string;
  colSpan?: number;
  mode?: 'readonly' | 'edit';
}

export default function WorkBlock({
  currentJob,
  jobs,
  workPreferences,
  title,
  colSpan = 2,
  mode = 'readonly',
}: WorkBlockProps) {
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [showScene, setShowScene] = useState(true);
  const sceneActivation = useNearViewportActivation();

  return (
    <GlassCard className="p-5 space-y-5 hover:border-teal-400/40 transition-all duration-300">
      <div ref={sceneActivation.targetRef} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            {title && <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>}
            <p className="text-[11px] text-gray-500 mt-0.5">{currentJob}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {colSpan === 2 && (
            <button
              onClick={() => setShowScene(!showScene)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:bg-white/60 dark:hover:bg-gray-800/60 text-gray-600 dark:text-gray-300 font-medium transition"
            >
              {showScene ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>隐藏 2D 闯关</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>显示 2D 闯关</span>
                </>
              )}
            </button>
          )}
          <span className="text-xs text-gray-400 font-mono">{jobs.length} 段经历</span>
        </div>
      </div>

      {colSpan === 2 && showScene && (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-teal-50/50 to-emerald-50/30 dark:from-teal-950/20 dark:to-emerald-950/10 p-2">
          {sceneActivation.active ? (
            <WorkScene
              jobs={jobs}
              onSelectJob={setSelectedJob}
              activeJobId={selectedJob?.company_name}
              mode={mode}
            />
          ) : <div className="min-h-[300px]" aria-hidden="true" />}
          <p className="text-[10px] text-gray-400 text-center mt-2">
            💡 点击上方 2D 关卡中的公司图标，可查看详细履历。
          </p>
        </div>
      )}

      <div className={`grid gap-3.5 ${colSpan === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {jobs.map((job, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedJob(job)}
            className="p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-white/20 hover:border-teal-400/40 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {job.company_name}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-medium">
                  {job.position_type}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                {job.position}
              </p>
              <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                {job.job_summary}
              </p>
            </div>
            <div className="text-[9px] text-gray-400 font-mono mt-3 text-right">
              {job.start_date} ~ {job.end_date}
            </div>
          </div>
        ))}
      </div>

      {workPreferences.length > 0 && (
        <div className="pt-3 border-t border-white/10">
          <h4 className="text-xs font-bold text-gray-400 mb-2">工作偏好</h4>
          <div className="flex flex-wrap items-center gap-1.5">
            {workPreferences.map((pref, idx) => (
              <Fragment key={`${pref}-${idx}`}>
                <span className="px-2.5 py-1 bg-teal-500/5 border border-teal-500/10 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300">
                  {pref}
                </span>
                {idx < workPreferences.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Modal for detailed job review */}
      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)}>
        {selectedJob && (
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedJob.company_name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedJob.start_date} ~ {selectedJob.end_date}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold">
                {selectedJob.position_type}
              </span>
            </div>

            <div>
              <span className="text-xs text-gray-400 block font-mono">POSITION</span>
              <p className="font-semibold text-gray-800 dark:text-gray-100 mt-0.5">
                {selectedJob.position}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-400 block font-mono">RESPONSIBLE PRODUCTS</span>
              <p className="mt-0.5 text-gray-800 dark:text-gray-200">
                {selectedJob.products_responsible_for}
              </p>
            </div>

            <div>
              <span className="text-xs text-gray-400 block font-mono">SUMMARY</span>
              <p className="mt-0.5 leading-relaxed text-gray-800 dark:text-gray-200">
                {selectedJob.job_summary}
              </p>
            </div>

            {selectedJob.work_output && (
              <div className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 block font-mono mb-1">WORK OUTPUT</span>
                <p className="text-xs leading-relaxed text-gray-800 dark:text-gray-200 font-mono">
                  {selectedJob.work_output}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
