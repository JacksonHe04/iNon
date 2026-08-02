export type WorldDayPhase = 'night' | 'dawn' | 'day' | 'dusk';

export interface WorldTimeSnapshot {
  totalMinutes: number;
  day: number;
  minuteOfDay: number;
  clockLabel: string;
  phase: WorldDayPhase;
  phaseLabel: string;
}

interface LightKeyframe {
  minute: number;
  background: string;
  fog: string;
  ambient: string;
  hemisphere: string;
  ground: string;
  sun: string;
  panorama: string;
  ambientIntensity: number;
  hemisphereIntensity: number;
  sunIntensity: number;
  exposure: number;
}

export const WORLD_TIME_START = 450;

export const WORLD_LIGHT_KEYFRAMES: LightKeyframe[] = [
  { minute: 0, background: '#26372e', fog: '#2b4036', ambient: '#809080', hemisphere: '#617467', ground: '#18261e', sun: '#748879', panorama: '#4d5c50', ambientIntensity: 0.22, hemisphereIntensity: 0.38, sunIntensity: 0.12, exposure: 0.58 },
  { minute: 300, background: '#6f796c', fog: '#566257', ambient: '#c0b9a1', hemisphere: '#a7b19f', ground: '#26392d', sun: '#d6a576', panorama: '#aaa488', ambientIntensity: 0.52, hemisphereIntensity: 0.78, sunIntensity: 1.25, exposure: 0.78 },
  { minute: 480, background: '#919d8b', fog: '#667565', ambient: '#d8d2b8', hemisphere: '#cbd0bd', ground: '#24392c', sun: '#e2d4aa', panorama: '#ffffff', ambientIntensity: 0.85, hemisphereIntensity: 1.3, sunIntensity: 2.6, exposure: 0.92 },
  { minute: 1020, background: '#857b68', fog: '#5a6253', ambient: '#c3ad8d', hemisphere: '#9da58e', ground: '#253529', sun: '#cf8c62', panorama: '#b9a784', ambientIntensity: 0.54, hemisphereIntensity: 0.82, sunIntensity: 1.35, exposure: 0.76 },
  { minute: 1200, background: '#304238', fog: '#31473b', ambient: '#879281', hemisphere: '#697a6d', ground: '#19271f', sun: '#7b8d83', panorama: '#59675a', ambientIntensity: 0.27, hemisphereIntensity: 0.44, sunIntensity: 0.18, exposure: 0.6 },
  { minute: 1440, background: '#26372e', fog: '#2b4036', ambient: '#809080', hemisphere: '#617467', ground: '#18261e', sun: '#748879', panorama: '#4d5c50', ambientIntensity: 0.22, hemisphereIntensity: 0.38, sunIntensity: 0.12, exposure: 0.58 },
];

export function worldTimeSnapshot(totalMinutes: number): WorldTimeSnapshot {
  const safeTotal = Math.max(0, Math.floor(totalMinutes));
  const minuteOfDay = safeTotal % 1440;
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const phase: WorldDayPhase = minuteOfDay < 300 || minuteOfDay >= 1200
    ? 'night'
    : minuteOfDay < 480
      ? 'dawn'
      : minuteOfDay < 1020
        ? 'day'
        : 'dusk';
  const labels: Record<WorldDayPhase, string> = { night: '深夜', dawn: '晨雾', day: '白昼', dusk: '暮色' };
  return {
    totalMinutes: safeTotal,
    day: Math.floor(safeTotal / 1440) + 1,
    minuteOfDay,
    clockLabel: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    phase,
    phaseLabel: labels[phase],
  };
}

export function worldLightFrame(minuteOfDay: number) {
  const upperIndex = WORLD_LIGHT_KEYFRAMES.findIndex((frame) => frame.minute >= minuteOfDay);
  const upper = WORLD_LIGHT_KEYFRAMES[Math.max(1, upperIndex)];
  const lower = WORLD_LIGHT_KEYFRAMES[Math.max(0, upperIndex - 1)];
  return { lower, upper, mix: (minuteOfDay - lower.minute) / (upper.minute - lower.minute) };
}
