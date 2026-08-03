import type { ReadmeData } from '@/types';
import type { LayoutConfig } from '@/types/layout';
import ArchiveBlockFrame from '@/components/archive/ArchiveBlockFrame';
import BlockRenderer from '@/components/blocks/BlockRenderer';

export default function ArchiveReadonlyGrid({
  data,
  layoutConfig,
}: {
  data: ReadmeData;
  layoutConfig: LayoutConfig;
}) {
  const activeBlocks = layoutConfig.blocks.filter((block) => block.visible);

  return (
    <section className="archive-block-grid" aria-label="个人档案目录">
      {activeBlocks.map((block, index) => (
        <ArchiveBlockFrame
          key={block.id}
          blockType={block.blockType}
          index={index}
          isWide={block.colSpan === 2}
          id={block.sectionId || block.id}
        >
          <BlockRenderer block={block} data={data} />
        </ArchiveBlockFrame>
      ))}
    </section>
  );
}
