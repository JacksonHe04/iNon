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

  useEffect(() => {
    const currentTheme = layoutConfig.theme || 'green';
    document.documentElement.setAttribute('data-color-theme', currentTheme);
    window.dispatchEvent(new CustomEvent('color-theme-changed', { detail: { theme: currentTheme } }));
  }, [layoutConfig.theme]);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        setTimeout(() => setSavedSuccess(false), 2000);
      } catch (e) {
        console.error('Failed to auto save layout:', e);
      } finally {
        setSaving(false);
      }
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  const handleThemeChange = (newTheme: 'green' | 'red' | 'orange' | 'blue' | 'gray') => {
    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, theme: newTheme };
      document.documentElement.setAttribute('data-color-theme', newTheme);
      window.dispatchEvent(new CustomEvent('color-theme-changed', { detail: { theme: newTheme } }));
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleToggleVisibility = (blockId: string) => {
    setLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) => (b.id === blockId ? { ...b, visible: !b.visible } : b));
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleToggleColSpan = (blockId: string) => {
    setLayoutConfig((prev) => {
      const nextBlocks: BlockConfig[] = prev.blocks.map((b) =>
        b.id === blockId ? { ...b, colSpan: (b.colSpan === 2 ? 1 : 2) as (1 | 2) } : b
      );
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layoutConfig.blocks.length) return;

    const nextBlocks = [...layoutConfig.blocks];
    const temp = nextBlocks[index];
    nextBlocks[index] = nextBlocks[targetIndex];
    nextBlocks[targetIndex] = temp;

    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, blocks: nextBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleReorderBlocks = (newBlocks: BlockConfig[]) => {
    setLayoutConfig((prev) => {
      const nextConfig: LayoutConfig = { ...prev, blocks: newBlocks };
      autoSave(nextConfig);
      return nextConfig;
    });
  };

  const handleResetLayout = () => {
    setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
    autoSave(DEFAULT_LAYOUT_CONFIG);
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
