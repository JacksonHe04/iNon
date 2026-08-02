import type { GameTelemetry } from '@/components/world/archiveGameTypes';
import {
  FIELD_ROUTE_STAGES,
  fieldRouteNavigation,
  type FieldRouteStage,
} from '@/components/world/archiveFieldRoute';
import styles from '@/components/world/WorldFieldRoute.module.css';

export default function WorldFieldRoute({
  telemetry,
  stage,
  stageIndex,
  recentStage,
}: {
  telemetry: GameTelemetry;
  stage: FieldRouteStage | null;
  stageIndex: number;
  recentStage: FieldRouteStage | null;
}) {
  if (!stage) {
    return (
      <>
        <aside className={`${styles.route} ${styles.complete}`} aria-label="田野路线已完成">
          <span>FIELD ROUTE / COMPLETE</span>
          <strong>海岸、河谷与雪线已经连成一段旅程</strong>
          <p>继续寻找余下札记，或回到主屋读取沿途收藏。</p>
        </aside>
        {recentStage && <RouteToast stage={recentStage} />}
      </>
    );
  }

  const navigation = fieldRouteNavigation(telemetry, stage);
  return (
    <>
      <aside className={styles.route} aria-label="当前田野路线">
        <header>
          <span>FIELD ROUTE · {stage.folio}</span>
          <b>{stageIndex + 1} / {FIELD_ROUTE_STAGES.length}</b>
        </header>
        <div>
          <i aria-hidden="true"><em style={{ transform: `rotate(${navigation.relativeBearing}deg)` }}>↑</em></i>
          <section>
            <strong>{stage.title}</strong>
            <p>{stage.instruction}</p>
          </section>
          <output>{navigation.distance}<small>M</small></output>
        </div>
      </aside>
      {recentStage && <RouteToast stage={recentStage} />}
    </>
  );
}

function RouteToast({ stage }: { stage: FieldRouteStage }) {
  return (
    <div className={styles.toast} role="status">
      <span>ROUTE MARKED / {stage.folio}</span>
      <strong>{stage.title}</strong>
      <small>田野路线已推进</small>
    </div>
  );
}
