'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { scrollToElement } from '@/lib/utils';
import type { BlockConfig, NavSectionConfig, BlockType } from '@/types/layout';
import { getBlockTitle, getBlockIcon } from '@/lib/blocks/registry';

export interface NavItem {
  id: string;
  scrollId: string;
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
  const navItems = useMemo<NavItem[]>(() => customItems
    ? customItems
    : blocks && blocks.length > 0
      ? blocks
          .filter((block) => block.visible)
          .map((block) => ({
            id: block.id,
            scrollId: block.sectionId || block.id,
            label: getBlockTitle(block.blockType),
            blockType: block.blockType,
          }))
      : [], [blocks, customItems]);

  const [activeSection, setActiveSection] = useState<string>(
    navItems[0]?.id ?? 'bio'
  );

  const isClickScrolling = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visibleSectionIds = useRef(new Set<string>());

  const activateFirstVisibleSection = useCallback(() => {
    const nextActive = navItems.find((item) => visibleSectionIds.current.has(item.id));
    if (nextActive) setActiveSection(nextActive.id);
  }, [navItems]);

  useEffect(() => {
    const sectionIds = visibleSectionIds.current;
    sectionIds.clear();
    const observedSections = new Map<Element, string>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = observedSections.get(entry.target);
        if (!id) continue;
        if (entry.isIntersecting) sectionIds.add(id);
        else sectionIds.delete(id);
      }
      if (!isClickScrolling.current) activateFirstVisibleSection();
    }, {
      rootMargin: '-120px 0px -60% 0px',
      threshold: 0,
    });

    for (const item of navItems) {
      const element = document.getElementById(item.scrollId);
      if (!element) continue;
      observedSections.set(element, item.id);
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      sectionIds.clear();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [activateFirstVisibleSection, navItems]);

  if (navItems.length === 0) {
    return null;
  }

  return (
    <nav
      className="fixed left-2 lg:left-4 -translate-y-1/2 z-40 hidden md:block"
      style={{ top: 'calc(50% + 40px)' }}
    >
      <div className="archive-side-nav border border-[var(--archive-line-strong)] bg-[rgb(var(--archive-paper-rgb)/0.94)] p-2">
        <div className="flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto scrollbar-none">
          {navItems.map((section) => {
            const Icon = section.blockType ? getBlockIcon(section.blockType) : null;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  isClickScrolling.current = true;
                  scrollToElement(section.scrollId);

                  if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                  }
                  scrollTimeoutRef.current = setTimeout(() => {
                    isClickScrolling.current = false;
                    activateFirstVisibleSection();
                  }, 800);
                }}
                className={`relative px-3 py-1.5 text-[10px] tracking-wide font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                  activeSection === section.id
                    ? 'text-gray-900 dark:text-white font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/20'
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
                  <div
                    className="absolute inset-0 bg-teal-500/10 border-l-2 border-teal-500/70 transition-colors duration-300"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
