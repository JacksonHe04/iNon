import BookBlock from '@/components/blocks/BookBlock';
import GameBlock from '@/components/blocks/GameBlock';
import MovieBlock from '@/components/blocks/MovieBlock';
import MusicBlock from '@/components/blocks/MusicBlock';
import type { LibraryItemDTO, LibraryKind } from '@/types';

interface LibraryPreviewPanelProps {
  creators: LibraryItemDTO[];
  kind: LibraryKind;
  selectedCategoryName: string;
  songs: LibraryItemDTO[];
  works: LibraryItemDTO[];
}

export default function LibraryPreviewPanel({
  creators,
  kind,
  selectedCategoryName,
  songs,
  works,
}: LibraryPreviewPanelProps) {
  const inCategory = (items: LibraryItemDTO[]) =>
    kind === 'music'
      ? items.filter((item) => item.categoryName === selectedCategoryName)
      : items;

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="rounded-3xl border border-white/10 bg-black/5 p-1 dark:bg-black/20">
        {kind === 'music' ? (
          <MusicBlock
            albums={inCategory(works)}
            songs={inCategory(songs)}
            musicians={inCategory(creators)}
            title={`${selectedCategoryName} · 音乐`}
            colSpan={2}
          />
        ) : null}
        {kind === 'film' ? <MovieBlock films={works} directors={creators} title="影视" colSpan={2} mode="readonly" /> : null}
        {kind === 'book' ? <BookBlock books={works} authors={creators} title="读书" colSpan={2} mode="readonly" /> : null}
        {kind === 'game' ? <GameBlock works={works} creators={creators} title="游戏" colSpan={2} /> : null}
      </div>
    </div>
  );
}
