'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { scrollToElement } from '@/lib/utils';
import type { BlockConfig, NavSectionConfig, BlockType } from '@/types/layout';
import { getBlockTitle, getBlockIcon } from '@/lib/blocks/registry';

export interface NavItem {
  id: string;
  label: string;
  blockType?: BlockType;
}

interface SideNavProps {
  blocks?: BlockConfig[];
  navSections?: NavSectionConfig[];
  customItems?: NavItem[];
}

export default function SideNav({ blocks, navSections, customItems }: SideNavProps) {
  // 每个可见的 block 在导航中独立成项；title 全部从 registry 单一事实源读取
  const navItems: NavItem[] = customItems
    ? customItems
    : blocks && blocks.length > 0
    ? blocks
        .filter((block) => block.visible)
        .map((block) => ({
          id: block.sectionId || block.id,
          label: getBlockTitle(block.blockType),
          blockType: block.blockType,
        }))
    : [];

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? 'bio'
  );

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

  if (navItems.length === 0) {
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
          {navItems.map((section) => {
            const Icon = section.blockType ? getBlockIcon(section.blockType) : null;
            return (
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
                <div className="relative z-10 flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        activeSection === section.id
                          ? 'text-teal-600 dark:text-teal-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    />
                  )}
                  <span>{section.label}</span>
                </div>
                {activeSection === section.id && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 bg-white/30 dark:bg-teal-500/20 rounded-xl border border-teal-500/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

