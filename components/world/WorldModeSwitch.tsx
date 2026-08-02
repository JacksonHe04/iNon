'use client';

import type { ArchiveWorldMode } from '@/components/world/archiveWorldConfig';

const MODES: Array<{ id: ArchiveWorldMode; label: string; detail: string }> = [
  { id: 'world', label: '世界', detail: '行走' },
  { id: 'archive', label: '档案', detail: '阅读' },
  { id: 'dialogue', label: '对话', detail: '交谈' },
];

export default function WorldModeSwitch({
  mode,
  onChange,
}: {
  mode: ArchiveWorldMode;
  onChange: (mode: ArchiveWorldMode) => void;
}) {
  return (
    <nav className="archive-world-mode-switch" aria-label="体验模式">
      {MODES.map((item) => (
        <button
          key={item.id}
          type="button"
          className={mode === item.id ? 'is-active' : undefined}
          aria-current={mode === item.id ? 'page' : undefined}
          onClick={() => onChange(item.id)}
        >
          <span>{item.label}</span>
          <small>{item.detail}</small>
        </button>
      ))}
    </nav>
  );
}
