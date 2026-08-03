import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import ArchiveReadonlyGrid from '@/components/blocks/ArchiveReadonlyGrid';

export default function ArchiveCodexPanel({
  data,
  layoutConfig,
}: {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
}) {
  return (
    <section className="archive-world-codex archive-world-codex--mode" aria-label="完整档案总览">
      <div className="archive-world-codex__scroll">
        <ArchiveReadonlyGrid data={data} layoutConfig={layoutConfig} />
      </div>
    </section>
  );
}
