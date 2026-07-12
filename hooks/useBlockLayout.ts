import { useState, useEffect, useRef } from 'react';
import type { LayoutConfig, BlockConfig } from '@/types/layout';
import { DEFAULT_LAYOUT_CONFIG } from '@/lib/content/default-layout';

interface UseBlockLayoutProps {
  initialLayoutConfig: LayoutConfig;
  onSave?: (config: LayoutConfig) => Promise<void>;
}

export function useBlockLayout({ initialLayoutConfig, onSave }: UseBlockLayoutProps) {
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>(initialLayoutConfig);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const saveRequestedRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentTheme = layoutConfig.theme || 'green';
    document.documentElement.setAttribute('data-color-theme', currentTheme);
    window.dispatchEvent(new CustomEvent('color-theme-changed', { detail: { theme: currentTheme } }));
  }, [layoutConfig.theme]);

  const autoSave = (newConfig: LayoutConfig) => {
    if (!onSave) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await onSave(newConfig);
        setSavedSuccess(true);
        if (savedSuccessTimeoutRef.current) {
          clearTimeout(savedSuccessTimeoutRef.current);
        }
        savedSuccessTimeoutRef.current = setTimeout(() => setSavedSuccess(false), 2000);
      } catch (e) {
        console.error('Failed to auto save layout:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  useEffect(() => {
    if (!saveRequestedRef.current) return;
    saveRequestedRef.current = false;
    autoSave(layoutConfig);
  }, [layoutConfig]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (savedSuccessTimeoutRef.current) {
        clearTimeout(savedSuccessTimeoutRef.current);
      }
    };
  }, []);

  const updateLayoutConfig = (updater: (prev: LayoutConfig) => LayoutConfig) => {
    saveRequestedRef.current = true;
    setLayoutConfig(updater);
  };

  const handleThemeChange = (newTheme: 'green' | 'red' | 'orange' | 'blue' | 'gray') => {
    updateLayoutConfig((prev) => ({ ...prev, theme: newTheme }));
  };

  const handleToggleVisibility = (blockId: string) => {
    updateLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b));
      return { ...prev, blocks: nextBlocks };
    });
  };

  const handleToggleColSpan = (blockId: string) => {
    updateLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) =>
        b.id === blockId ? { ...b, colSpan: (b.colSpan === 2 ? 1 : 2) as (1 | 2) } : b
      );
      return { ...prev, blocks: nextBlocks };
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutConfig.blocks.length) return;

    const nextBlocks = [...layoutConfig.blocks];
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIndex];
    nextBlocks[targetIndex] = temp;

    updateLayoutConfig((prev) => ({ ...prev, blocks: nextBlocks }));
  };

  const handleReorderBlocks = (newBlocks: BlockConfig[]) => {
    updateLayoutConfig((prev) => ({ ...prev, blocks: newBlocks }));
  };

  const handleResetLayout = () => {
    updateLayoutConfig(() => DEFAULT_LAYOUT_CONFIG);
  };

  return {
    layoutConfig,
    saving,
    savedSuccess,
    handleThemeChange,
    handleToggleVisibility,
    handleToggleColSpan,
    handleMoveBlock,
    handleReorderBlocks,
    handleResetLayout,
  };
}
export default useBlockLayout;
