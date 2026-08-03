'use client';

import { WORLD_KEEPSAKE_COUNT } from '@/components/world/ArchiveGameScene';
import type { ArchiveKeepsake } from '@/components/world/archiveKeepsakes';
import { ARCHIVE_SPECIES, ARCHIVE_SPECIES_COUNT } from '@/components/world/archiveSpeciesCatalog';
import styles from '@/components/world/WorldSatchel.module.css';
import { FIELD_ROUTE_STAGES } from '@/components/world/archiveFieldRoute';

const FIELD_HABITATS = ['家园', '林地', '草原', '河谷', '海岸', '天空'] as const;

export default function WorldSatchel({
  rations,
  keepsakes,
  fieldRouteStageIndex,
  forageIngredients,
  onUseRation,
  onRestartRoute,
  onClose,
}: {
  rations: number;
  keepsakes: ArchiveKeepsake[];
  fieldRouteStageIndex: number;
  forageIngredients: number;
  onUseRation: () => void;
  onRestartRoute: () => void;
  onClose: () => void;
}) {
  return (
    <aside className="archive-world-inventory archive-world-satchel" aria-label="随身背包">
      <header>
        <div>
          <span>FIELD SATCHEL / B</span>
          <h2>随身背包</h2>
        </div>
        <button onClick={onClose}>收起 ×</button>
      </header>
      <p className="archive-world-inventory__note">
        背包只装随身物资和在野外拾得的东西。唱片、影片、书与个人档案属于主屋，不再被塞进背包或散落到远方。
      </p>
      <div className="archive-world-inventory__supplies">
        <div>
          <span>田野口粮</span>
          <strong>{rations}</strong>
          <button onClick={onUseRation} disabled={rations <= 0}>食用并恢复体力</button>
        </div>
        <div>
          <span>拾得旧纸片</span>
          <strong>{keepsakes.length} / {WORLD_KEEPSAKE_COUNT}</strong>
          <small>纸片会留在背包，主屋收藏不会。</small>
        </div>
        <div>
          <span>测绘工具</span>
          <strong>1</strong>
          <small>小地图、罗盘与高度计共用同一份世界坐标。</small>
        </div>
        <div>
          <span>采得食材</span>
          <strong>{forageIngredients} / 3</strong>
          <small>三份可在家园或雪线的现有营火旁烹成一份口粮。</small>
        </div>
      </div>
      <details className={styles.routeJournal} open>
        <summary>
          <span>FIELD ROUTE / JOURNEY</span>
          <strong>田野路线</strong>
          <b>{Math.min(fieldRouteStageIndex, FIELD_ROUTE_STAGES.length)} / {FIELD_ROUTE_STAGES.length}</b>
        </summary>
        <ol>
          {FIELD_ROUTE_STAGES.map((stage, index) => (
            <li
              key={stage.id}
              className={index < fieldRouteStageIndex ? styles.done : index === fieldRouteStageIndex ? styles.current : ''}
            >
              <span>{stage.folio}</span>
              <strong>{stage.title}</strong>
            </li>
          ))}
        </ol>
        <button type="button" onClick={onRestartRoute}>重新开始这段旅程</button>
      </details>
      <details className={styles.fieldGuide}>
        <summary>
          <span>FIELD GUIDE / VERIFIED</span>
          <strong>动物观察册</strong>
          <b>{ARCHIVE_SPECIES_COUNT} 种生态记录 ＋</b>
        </summary>
        <div>
          {FIELD_HABITATS.map((habitat, index) => {
            const species = ARCHIVE_SPECIES.filter((record) => record.habitat === habitat);
            return (
              <section key={habitat}>
                <span>{String(index + 1).padStart(2, '0')} / {habitat}</span>
                <strong>{species.length}</strong>
                <p>{species.map((record) => record.label).join(' · ')}</p>
              </section>
            );
          })}
        </div>
      </details>
      <section className={`archive-world-field-notes ${styles.fieldNotes}`} aria-label="已拾得的田野札记">
        <header>
          <span>RECOVERED WRITINGS</span>
          <strong>田野札记</strong>
        </header>
        {keepsakes.length ? (
          <div>
            {keepsakes.map((keepsake) => (
              <article key={keepsake.id}>
                <span>{keepsake.folio} · {keepsake.kind}</span>
                <blockquote>{keepsake.text}</blockquote>
                <small>{keepsake.note}</small>
              </article>
            ))}
          </div>
        ) : (
          <p>还没有拾到卷轴。它们在海岸、森林、河谷与雪线等待。</p>
        )}
      </section>
    </aside>
  );
}
