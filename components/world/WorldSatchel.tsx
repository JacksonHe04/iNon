'use client';

import { WORLD_KEEPSAKE_COUNT } from '@/components/world/ArchiveGameScene';

export default function WorldSatchel({
  rations,
  keepsakes,
  onUseRation,
  onClose,
}: {
  rations: number;
  keepsakes: number;
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
          <strong>{keepsakes} / {WORLD_KEEPSAKE_COUNT}</strong>
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
    </aside>
  );
}
