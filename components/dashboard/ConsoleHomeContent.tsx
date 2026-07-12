'use client';

import AITestConsole from './AITestConsole';
import ShortcutBookmarksManager from './ShortcutBookmarksManager';
import ProjectShortcutsList from './ProjectShortcutsList';
import type { ReadmeData } from '@/types';

interface ConsoleHomeContentProps {
  data: ReadmeData;
}

export default function ConsoleHomeContent({ data }: ConsoleHomeContentProps) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <AITestConsole name={data.basic.name} />
      <ShortcutBookmarksManager
        initialDevTools={data.development.dev_tools}
        developmentData={data.development}
      />
      <ProjectShortcutsList projects={data.development.projects} />
    </div>
  );
}
