export type WorldVitalityLabel = '安稳' | '擦伤' | '重伤' | '濒危';

export function worldVitalityLabel(value: number): WorldVitalityLabel {
  if (value >= 72) return '安稳';
  if (value >= 38) return '擦伤';
  if (value >= 12) return '重伤';
  return '濒危';
}

export function fallDamageForImpact(impactSpeed: number, mounted: boolean) {
  const safeSpeed = mounted ? 15 : 10.5;
  if (impactSpeed <= safeSpeed) return 0;
  return Math.min(99, Math.round(Math.pow(impactSpeed - safeSpeed, 1.35) * 3.1));
}

export function vitalityMovementFactor(vitality: number) {
  if (vitality >= 38) return 1;
  return 0.72 + (Math.max(1, vitality) / 38) * 0.28;
}

export interface FallImpactTracker {
  peakDownSpeed: number;
  airborne: boolean;
}

export function trackFallImpact(
  tracker: FallImpactTracker,
  verticalSpeed: number,
  flying: boolean,
) {
  if (flying) {
    tracker.airborne = false;
    tracker.peakDownSpeed = 0;
    return 0;
  }
  if (verticalSpeed < -1.5) {
    tracker.airborne = true;
    tracker.peakDownSpeed = Math.max(tracker.peakDownSpeed, -verticalSpeed);
    return 0;
  }
  if (!tracker.airborne || verticalSpeed < -0.65) return 0;
  const impact = tracker.peakDownSpeed;
  tracker.airborne = false;
  tracker.peakDownSpeed = 0;
  return impact;
}
