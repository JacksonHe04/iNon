import type { ArchiveKeepsake } from '@/components/world/archiveKeepsakes';
import type { RestFeedback } from '@/hooks/useArchiveResting';
import type { ForageFeedback } from '@/hooks/useArchiveForaging';
import type { VitalityFeedback } from '@/hooks/useArchiveVitality';
import type { ArchiveSpecies } from '@/components/world/archiveSpeciesCatalog';

export default function WorldFieldFeedback({
  active,
  lastKeepsake,
  keepsakeCount,
  restFeedback,
  forageFeedback,
  forageIngredients,
  vitalityFeedback,
  lastObservedSpecies,
}: {
  active: boolean;
  lastKeepsake?: ArchiveKeepsake;
  keepsakeCount: number;
  restFeedback: RestFeedback | null;
  forageFeedback: ForageFeedback | null;
  forageIngredients: number;
  vitalityFeedback: VitalityFeedback | null;
  lastObservedSpecies?: ArchiveSpecies;
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
      {lastObservedSpecies && !lastKeepsake && (
        <div className="archive-world-keepsake-toast" role="status">
          <span>FIELD SIGHTING / {lastObservedSpecies.habitat}</span>
          <strong>首次目击 · {lastObservedSpecies.label}</strong>
          <small>生态观察册已留下这一种真实遭遇</small>
        </div>
      )}
      {vitalityFeedback && !lastKeepsake && !lastObservedSpecies && (
        <div className="archive-world-keepsake-toast is-impact" role="status">
          <span>HARD LANDING / IMPACT {vitalityFeedback.impactSpeed.toFixed(1)} M/S</span>
          <strong>高处坠落 · 生命 -{vitalityFeedback.damage}</strong>
          <small>放慢脚步；口粮可少量疗伤，床铺与营火可完全恢复。</small>
        </div>
      )}
      {restFeedback && !forageFeedback && !vitalityFeedback && !lastObservedSpecies && (
        <div className="archive-world-keepsake-toast is-rest" role="status">
          <span>{restFeedback.site.folio}</span>
          <strong>{restFeedback.status === 'rested' ? '生命、体力与体温已经恢复' : '背包里没有足够口粮'}</strong>
          <small>{restFeedback.status === 'rested'
            ? `${restFeedback.site.title} · ${restFeedback.site.rationCost ? '口粮 -1' : '家园补给'} · 时间 +6H`
            : '返回主屋补给，或在背包中检查物资'}</small>
        </div>
      )}
      {forageFeedback && !lastObservedSpecies && (
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
