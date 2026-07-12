export const MOTION_TOKENS = {
  spring: {
    gentle: { type: 'spring', stiffness: 120, damping: 14 },
    snappy: { type: 'spring', stiffness: 260, damping: 20 },
    bouncy: { type: 'spring', stiffness: 300, damping: 15 },
  },
  tween: {
    standard: { ease: 'easeInOut', duration: 0.3 },
    fast: { ease: 'easeOut', duration: 0.15 },
  },
} as const;
