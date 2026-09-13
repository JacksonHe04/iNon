import type { CSSProperties } from 'react';

const PROFILE_RELICS = [
  'ginkgo',
  'oak',
  'pods',
  'moth',
  'ticket',
  'film',
  'key',
  'thread',
  'wax',
  'map',
  'label',
  'envelope',
] as const;

type LeafTone = 'ochre' | 'rust' | 'sage' | 'lichen' | 'seal';

interface LeafSpec {
  left: string;
  delay: string;
  duration: string;
  size: string;
  sway: string;
  swayDuration: string;
  spin: string;
  spinDuration: string;
  drift: string;
  tone: LeafTone;
}

const LEAVES: LeafSpec[] = [
  { left: '2%', delay: '-1s', duration: '14s', size: '13px', sway: '24px', swayDuration: '3.2s', spin: '320deg', spinDuration: '9s', drift: '6vw', tone: 'ochre' },
  { left: '6%', delay: '-8.5s', duration: '17s', size: '10px', sway: '18px', swayDuration: '2.7s', spin: '-260deg', spinDuration: '8s', drift: '-4vw', tone: 'lichen' },
  { left: '11%', delay: '-3.5s', duration: '12.5s', size: '15px', sway: '30px', swayDuration: '3.8s', spin: '380deg', spinDuration: '10s', drift: '7vw', tone: 'rust' },
  { left: '16%', delay: '-14s', duration: '18s', size: '9px', sway: '16px', swayDuration: '2.4s', spin: '-300deg', spinDuration: '8.5s', drift: '-5vw', tone: 'sage' },
  { left: '21%', delay: '-5s', duration: '13.5s', size: '14px', sway: '26px', swayDuration: '3.4s', spin: '340deg', spinDuration: '9.5s', drift: '5vw', tone: 'ochre' },
  { left: '26%', delay: '-11.5s', duration: '16s', size: '11px', sway: '20px', swayDuration: '2.9s', spin: '-280deg', spinDuration: '8s', drift: '-6vw', tone: 'seal' },
  { left: '31%', delay: '-0.5s', duration: '13s', size: '13px', sway: '28px', swayDuration: '3.6s', spin: '360deg', spinDuration: '10s', drift: '4vw', tone: 'lichen' },
  { left: '36%', delay: '-6.5s', duration: '17.5s', size: '10px', sway: '18px', swayDuration: '2.6s', spin: '-320deg', spinDuration: '8.5s', drift: '-4vw', tone: 'sage' },
  { left: '41%', delay: '-4s', duration: '14s', size: '15px', sway: '30px', swayDuration: '3.9s', spin: '300deg', spinDuration: '9s', drift: '6vw', tone: 'rust' },
  { left: '46%', delay: '-12s', duration: '16.5s', size: '11px', sway: '22px', swayDuration: '3s', spin: '-280deg', spinDuration: '8.5s', drift: '-5vw', tone: 'ochre' },
  { left: '51%', delay: '-2.5s', duration: '12.5s', size: '12px', sway: '24px', swayDuration: '3.3s', spin: '340deg', spinDuration: '9s', drift: '5vw', tone: 'seal' },
  { left: '56%', delay: '-9.5s', duration: '18s', size: '9px', sway: '16px', swayDuration: '2.5s', spin: '-300deg', spinDuration: '8s', drift: '-3vw', tone: 'sage' },
  { left: '61%', delay: '-5.5s', duration: '13.5s', size: '14px', sway: '26px', swayDuration: '3.5s', spin: '330deg', spinDuration: '9.5s', drift: '6vw', tone: 'ochre' },
  { left: '66%', delay: '-15s', duration: '16s', size: '10px', sway: '18px', swayDuration: '2.8s', spin: '-270deg', spinDuration: '8s', drift: '-4vw', tone: 'lichen' },
  { left: '71%', delay: '-3s', duration: '12.5s', size: '13px', sway: '28px', swayDuration: '3.7s', spin: '350deg', spinDuration: '9.5s', drift: '5vw', tone: 'rust' },
  { left: '76%', delay: '-10.5s', duration: '17s', size: '11px', sway: '20px', swayDuration: '2.9s', spin: '-290deg', spinDuration: '8.5s', drift: '-6vw', tone: 'sage' },
  { left: '81%', delay: '-6s', duration: '14.5s', size: '14px', sway: '26px', swayDuration: '3.4s', spin: '310deg', spinDuration: '9s', drift: '4vw', tone: 'ochre' },
  { left: '86%', delay: '-13s', duration: '16.5s', size: '10px', sway: '18px', swayDuration: '2.6s', spin: '-310deg', spinDuration: '8.5s', drift: '-5vw', tone: 'seal' },
  { left: '91%', delay: '-2s', duration: '13s', size: '12px', sway: '24px', swayDuration: '3.2s', spin: '330deg', spinDuration: '9s', drift: '5vw', tone: 'lichen' },
  { left: '96%', delay: '-7.5s', duration: '17.5s', size: '9px', sway: '16px', swayDuration: '2.5s', spin: '-300deg', spinDuration: '8s', drift: '-3vw', tone: 'sage' },
  { left: '9%', delay: '-16s', duration: '19s', size: '8px', sway: '14px', swayDuration: '2.3s', spin: '-240deg', spinDuration: '7.5s', drift: '-3vw', tone: 'ochre' },
  { left: '34%', delay: '-17.5s', duration: '19.5s', size: '8px', sway: '15px', swayDuration: '2.4s', spin: '260deg', spinDuration: '7.5s', drift: '4vw', tone: 'rust' },
  { left: '59%', delay: '-18.5s', duration: '19s', size: '8px', sway: '14px', swayDuration: '2.3s', spin: '-250deg', spinDuration: '7.5s', drift: '-4vw', tone: 'lichen' },
  { left: '84%', delay: '-19.5s', duration: '19.5s', size: '8px', sway: '15px', swayDuration: '2.4s', spin: '270deg', spinDuration: '8s', drift: '3vw', tone: 'sage' },
];

const leafStyle = (leaf: LeafSpec): CSSProperties => ({
  left: leaf.left,
  animationDelay: leaf.delay,
  animationDuration: leaf.duration,
  ['--sway' as string]: leaf.sway,
  ['--sway-duration' as string]: leaf.swayDuration,
  ['--spin' as string]: leaf.spin,
  ['--spin-duration' as string]: leaf.spinDuration,
  ['--drift' as string]: leaf.drift,
});

export default function ArchiveAtmosphere({ profile = false }: { profile?: boolean }) {
  return (
    <div
      className={`archive-atmosphere archive-atmosphere--${profile ? 'profile' : 'global'}`}
      aria-hidden="true"
    >
      <div className="archive-atmosphere__landscape" />
      {profile ? <div className="archive-atmosphere__wood" /> : null}
      <div className="archive-atmosphere__paper" />
      <div className="archive-atmosphere__grain" />
      {profile ? (
        <>
          <div className="archive-atmosphere__dust" />
          <div className="archive-atmosphere__leaves">
            {LEAVES.map((leaf, index) => (
              <span key={index} className="archive-leaf" data-tone={leaf.tone} style={leafStyle(leaf)}>
                <span className="archive-leaf__sway">
                  <span className="archive-leaf__blade" />
                </span>
              </span>
            ))}
          </div>
          <div className="archive-atmosphere__relics">
            {PROFILE_RELICS.map((relic) => (
              <span key={relic} className="archive-relic" data-relic={relic} />
            ))}
          </div>
        </>
      ) : null}
      <div className="archive-atmosphere__botanical" />
      <div className="archive-atmosphere__branch" />
      <div className="archive-atmosphere__birds" />
      <div className="archive-atmosphere__postage" />
      <div className="archive-atmosphere__registration">INON / FIELD ARCHIVE / 2026</div>
    </div>
  );
}
