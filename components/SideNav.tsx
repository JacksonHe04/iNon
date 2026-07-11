'use client';

import { useEffect, useState, useRef } from 'react';
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
    ? (() => {
        const items: NavItem[] = [];
        const seenSectionIds = new Set<string>();

        for (const block of effectiveBlocks) {
          if (!block.visible) continue;

          const section = effectiveNavSections.find(
            (s) => s.id === block.sectionId || s.targetBlockId === block.id
          );

          if (section && !seenSectionIds.has(section.id)) {
            seenSectionIds.add(section.id);
            items.push({
              id: block.sectionId || block.id,
              label: section.label,
            });
          }
        }
        return items;
      })()
    : DEFAULT_NAV_SECTIONS;

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? 'bio'
  );
  const [deepWaterActive, setDeepWaterActive] = useState(false);

  const isClickScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // 如果是点击触发的平滑滚动，在滚动完成前不根据位置重新计算激活项，防止高亮框乱跳
      if (isClickScrolling.current) return;

      // 1. 优先判断是否滚动到了页面底部
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      if (isAtBottom && navItems.length > 0) {
        setActiveSection(navItems[navItems.length - 1].id);
        return;
      }

      // 2. 正常滚动情况：找到当前最符合可见性的 section
      let activeId = navItems[0]?.id;
      let minDiff = Infinity;
      const targetLine = 120; // 触发线：距离视口顶部 120px 处（避开顶栏高度）

      for (const item of navItems) {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // 如果元素刚好跨越触发线，则当前激活项必定是它
          if (rect.top <= targetLine && rect.bottom >= targetLine) {
            activeId = item.id;
            break;
          }

          // 否则，找到距离触发线最近的元素
          const diff = Math.abs(rect.top - targetLine);
          if (diff < minDiff) {
            minDiff = diff;
            activeId = item.id;
          }
        }
      }

      if (activeId) {
        setActiveSection(activeId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
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
              onClick={() => {
                setActiveSection(section.id);
                isClickScrolling.current = true;
                scrollToElement(section.id);

                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = setTimeout(() => {
                  isClickScrolling.current = false;
                }, 800);
              }}
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

