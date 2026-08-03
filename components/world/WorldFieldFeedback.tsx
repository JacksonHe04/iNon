import type { ArchiveKeepsake } from '@/components/world/archiveKeepsakes';
import type { RestFeedback } from '@/hooks/useArchiveResting';
import type { ForageFeedback } from '@/hooks/useArchiveForaging';

export default function WorldFieldFeedback({
  active,
  lastKeepsake,
  keepsakeCount,
  restFeedback,
  forageFeedback,
  forageIngredients,
}: {
  active: boolean;
  lastKeepsake?: ArchiveKeepsake;
  keepsakeCount: number;
  restFeedback: RestFeedback | null;
  forageFeedback: ForageFeedback | null;
  forageIngredients: number;
}) {
  if (!active) return null;
  return (
    <>
      {lastKeepsake && (
        <div className="archive-world-keepsake-toast" role="status">
          <span>FIELD PAGE RECOVERED</span>
          <strong>{lastKeepsake.text}</strong>
          <small>{lastKeepsake.kind} · {keepsakeCount}</small>
        </div>
      )}
      {restFeedback && !forageFeedback && (
        <div className="archive-world-keepsake-toast is-rest" role="status">
          <span>{restFeedback.site.folio}</span>
          <strong>{restFeedback.status === 'rested' ? '体力已经恢复' : '背包里没有足够口粮'}</strong>
          <small>{restFeedback.status === 'rested'
            ? `${restFeedback.site.title} · ${restFeedback.site.rationCost ? '口粮 -1' : '家园补给'} · 时间 +6H`
            : '返回主屋补给，或在背包中检查物资'}</small>
        </div>
      )}
      {forageFeedback && (
        <div className="archive-world-keepsake-toast is-rest" role="status">
          <span>{forageFeedback.patch?.folio ?? 'FIRE / FIELD KITCHEN'}</span>
          <strong>{forageFeedback.status === 'gathered'
            ? `采得${forageFeedback.patch?.label}`
            : forageFeedback.status === 'cooked' ? '烹成一份田野口粮' : '食材还不够'}</strong>
          <small>{forageFeedback.status === 'gathered'
            ? `背包食材 ${forageIngredients} / 3 · 次日重新生长`
            : forageFeedback.status === 'cooked' ? '食材 -3 · 田野口粮 +1' : `还需要 ${Math.max(0, 3 - forageIngredients)} 份野外食材`}</small>
        </div>
      )}
    </>
  );
}
