'use client';

import { WORLD_KEEPSAKE_COUNT } from '@/components/world/ArchiveGameScene';
import type { ArchiveKeepsake } from '@/components/world/archiveKeepsakes';
import { ARCHIVE_SPECIES, ARCHIVE_SPECIES_COUNT } from '@/components/world/archiveSpeciesCatalog';
import styles from '@/components/world/WorldSatchel.module.css';

const FIELD_HABITATS = ['家园', '林地', '草原', '河谷', '海岸', '天空'] as const;

export default function WorldSatchel({
  rations,
  keepsakes,
  onUseRation,
  onClose,
}: {
  rations: number;
  keepsakes: ArchiveKeepsake[];
  onUseRation: () => void;
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
          <span>马匹口粮</span>
          <strong>2</strong>
          <small>留给林径马匹的苹果。</small>
        </div>
      </div>
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
