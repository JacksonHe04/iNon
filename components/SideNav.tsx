'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { scrollToElement } from '@/lib/utils';
import type { BlockConfig, NavSectionConfig } from '@/types/layout';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';

export interface NavItem {
  id: string;
  label: string;
}

export const DEFAULT_NAV_SECTIONS: NavItem[] = [
  { id: 'bio', label: '个人简介' },
  { id: 'bookmarks', label: '网站快捷' },
  { id: 'projects', label: '项目展示' },
  { id: 'timeline', label: '里程碑' },
  { id: 'music', label: '音乐收藏' },
  { id: 'movies', label: '影视墙' },
  { id: 'books', label: '书单' },
  { id: 'friend_links', label: '友情链接' },
  { id: 'contact', label: '联系方式' },
];

export const NAV_SECTIONS = DEFAULT_NAV_SECTIONS;

interface SideNavProps {
  blocks?: BlockConfig[];
  navSections?: NavSectionConfig[];
  customItems?: NavItem[];
}

export default function SideNav({ blocks, navSections, customItems }: SideNavProps) {
  const effectiveBlocks = blocks || DEFAULT_LAYOUT_CONFIG.blocks;
  const effectiveNavSections = navSections || DEFAULT_LAYOUT_CONFIG.navSections;

  // Determine dynamic navigation items based on visible blocks or custom items
  const navItems: NavItem[] = customItems
    ? customItems
    : effectiveBlocks && effectiveBlocks.length > 0
    ? effectiveNavSections
        .filter((section) => {
          const sectionBlocks = effectiveBlocks.filter(
            (b) => b.sectionId === section.id || b.id === section.targetBlockId
          );
          return sectionBlocks.some((b) => b.visible);
        })
        .map((section) => {
          const firstVisibleBlock = effectiveBlocks.find(
            (b) =>
              (b.sectionId === section.id || b.id === section.targetBlockId) &&
              b.visible
          );
          return {
            id: firstVisibleBlock?.sectionId || firstVisibleBlock?.id || section.id,
            label: section.label,
          };
        })
    : DEFAULT_NAV_SECTIONS;

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? 'bio'
  );
  const [deepWaterActive, setDeepWaterActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = navItems.length - 1; i >= 0; i--) {
        const element = document.getElementById(navItems[i].id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navItems]);

  useEffect(() => {
    const handleDeepWater = (event: Event) => {
      const detail = (event as CustomEvent<{ active: boolean }>).detail;
      setDeepWaterActive(detail?.active ?? false);
    };

    window.addEventListener('deepwater-visibility', handleDeepWater as EventListener);
    return () => {
      window.removeEventListener('deepwater-visibility', handleDeepWater as EventListener);
    };
  }, []);

  if (deepWaterActive || navItems.length === 0) {
    return null;
  }

  return (
    <motion.nav
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="fixed left-2 lg:left-4 -translate-y-1/2 z-40 hidden md:block"
      style={{ top: 'calc(50% + 40px)' }}
    >
      <div className="rounded-2xl border border-white/30 bg-white/30 backdrop-blur-xl p-3 shadow-lg">
        <div className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto scrollbar-none">
          {navItems.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToElement(section.id)}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === section.id
                  ? 'bg-white/30 dark:bg-gray-800/40 text-gray-900 dark:text-white font-bold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/10'
              }`}
            >
              <span className="relative z-10">{section.label}</span>
              {activeSection === section.id && (
                <motion.div
                  layoutId="activeSection"
                  className="absolute inset-0 bg-white/30 dark:bg-teal-500/20 rounded-xl border border-teal-500/30"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}

