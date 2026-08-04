'use client';

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import Modal from '@/components/Modal';
import { ExternalLink } from 'lucide-react';
import BlockImage from './BlockImage';
import ArchiveSectionHeading from '@/components/archive/ArchiveSectionHeading';
import useNearViewportActivation from '@/hooks/useNearViewportActivation';

export interface CollectionItem {
  id?: string;
  name: string;
  image_url?: string;
  link?: string;
  comment?: string;
  [key: string]: any;
}

export interface CollectionTabConfig {
  id: string;
  label: string;
  items: CollectionItem[];
  icon: React.ComponentType<{ className?: string }>;
  getCardMeta: (item: CollectionItem) => {
    title: string;
    subTitle: string;
  };
}

interface CollectionGridBlockProps {
  tabs: CollectionTabConfig[];
  title: string;
  blockIcon: React.ComponentType<{ className?: string }>;
  gradientColors?: string[];
  themeColorClass?: string; // e.g. 'indigo', 'amber', 'emerald'
  colSpan?: number;
  interactiveScene?: React.ReactNode;
  showScene?: boolean;
  onToggleScene?: () => void;
  sceneToggleText?: string;
}

export default function CollectionGridBlock({
  tabs,
  title,
  blockIcon: BlockIcon,
  gradientColors,
  themeColorClass = 'indigo',
  colSpan = 2,
  interactiveScene,
  showScene = false,
  onToggleScene,
  sceneToggleText,
}: CollectionGridBlockProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '');
  const [selectedDetail, setSelectedDetail] = useState<{
    title: string;
    subTitle: string;
    comment: string;
    link?: string;
  } | null>(null);
  const sceneActivation = useNearViewportActivation();

  const getGradient = (idx: number) => {
    const gradients = gradientColors || [
      'from-indigo-400 to-purple-400',
      'from-purple-400 to-violet-400',
      'from-blue-400 to-indigo-400',
      'from-violet-400 to-fuchsia-400',
    ];
    return gradients[idx % gradients.length];
  };

  const activeTabConfig = tabs.find((t) => t.id === activeTab) || tabs[0];
  const items = activeTabConfig?.items || [];
  const TabIcon = activeTabConfig?.icon;

  // Custom border hover class mapping to bypass Tailwind dynamic class compilation limitations
  const hoverBorderClasses: Record<string, string> = {
    indigo: 'hover:border-indigo-400/40',
    amber: 'hover:border-amber-400/40',
    emerald: 'hover:border-emerald-400/40',
    cyan: 'hover:border-cyan-400/40',
    orange: 'hover:border-orange-400/40',
  };

  const textColors: Record<string, string> = {
    indigo: 'text-indigo-600 dark:text-indigo-400',
    amber: 'text-amber-600 dark:text-amber-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    cyan: 'text-cyan-600 dark:text-cyan-400',
    orange: 'text-orange-600 dark:text-orange-400',
  };

  const bgClasses: Record<string, string> = {
    indigo: 'bg-indigo-500/10 border-indigo-500/30',
    amber: 'bg-amber-500/10 border-amber-500/30',
    emerald: 'bg-emerald-500/10 border-emerald-500/30',
    cyan: 'bg-cyan-500/10 border-cyan-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
  };

  const iconColors: Record<string, string> = {
    indigo: 'text-indigo-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
    cyan: 'text-cyan-500',
    orange: 'text-orange-500',
  };

  return (
    <GlassCard className={`p-5 space-y-5 transition-all duration-300 ${hoverBorderClasses[themeColorClass] || hoverBorderClasses.indigo}`}>
      <div ref={sceneActivation.targetRef} className="relative">
        <ArchiveSectionHeading title={title} icon={BlockIcon} count={items.length} />
        {onToggleScene && interactiveScene && colSpan === 2 && (
          <button
            onClick={onToggleScene}
            className="absolute right-20 top-1 flex items-center gap-1 px-2.5 py-1 text-[9px] font-mono border border-[var(--archive-line)] hover:border-[var(--archive-line-strong)] text-gray-600 dark:text-gray-300 transition cursor-pointer"
          >
            <span>{showScene ? '隐藏' : '显示'}{sceneToggleText || '互动'}</span>
          </button>
        )}
      </div>

      {colSpan === 2 && showScene && interactiveScene && (
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10 p-2">
          {sceneActivation.active
            ? interactiveScene
            : <div className="min-h-[300px]" aria-hidden="true" />}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[var(--archive-line)] pb-1 overflow-x-auto whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-3 py-1.5 text-[10px] font-mono font-semibold border transition cursor-pointer ${
                isActive
                  ? `${bgClasses[themeColorClass] || bgClasses.indigo} ${textColors[themeColorClass] || textColors.indigo}`
                  : 'bg-transparent border-transparent text-gray-500 hover:text-gray-800 hover:bg-white/20 dark:hover:bg-gray-800/20'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono opacity-70 ml-1">({tab.items.length})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 min-h-[160px]">
        <div className={`grid gap-3 ${colSpan === 2 ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-2'}`}>
          {items.map((item, idx) => {
            const meta = activeTabConfig.getCardMeta(item);
            return (
              <div
                key={idx}
                onClick={() =>
                  setSelectedDetail({
                    title: meta.title,
                    subTitle: meta.subTitle,
                    comment: item.comment || '',
                    link: item.link,
                  })
                }
                className={`archive-index-card p-3 bg-white/40 dark:bg-gray-800/40 border border-[var(--archive-line)] transition cursor-pointer flex flex-col justify-between ${hoverBorderClasses[themeColorClass] || hoverBorderClasses.indigo}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black text-gray-900 dark:text-white/70">
                      NO.{String(idx + 1).padStart(2, '0')}
                    </span>
                    {TabIcon && <TabIcon className={`w-3.5 h-3.5 ${iconColors[themeColorClass] || iconColors.indigo}`} />}
                  </div>
                  <BlockImage
                    src={item.image_url || item.imageUrl}
                    alt={meta.title}
                    fallback={
                      <div className={`aspect-square rounded-lg mb-2 bg-gradient-to-br ${getGradient(idx)} opacity-80`} />
                    }
                  />
                  <h4 className="font-bold text-xs text-gray-800 dark:text-white truncate">
                    {meta.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">{meta.subTitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={!!selectedDetail} onClose={() => setSelectedDetail(null)}>
        {selectedDetail && (
          <div className="space-y-3.5 text-gray-700 dark:text-gray-200">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedDetail.title}
            </h3>
            <p className="text-xs text-gray-400 font-medium">{selectedDetail.subTitle}</p>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 italic">
              “ {selectedDetail.comment} ”
            </p>
            {selectedDetail.link && selectedDetail.link.trim() !== '' && (
              <a
                href={selectedDetail.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1 text-sm font-semibold hover:underline mt-2 ${textColors[themeColorClass] || textColors.indigo}`}
              >
                <span>了解更多</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </Modal>
    </GlassCard>
  );
}
