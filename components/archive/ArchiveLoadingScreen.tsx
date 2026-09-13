import styles from './ArchiveLoadingScreen.module.css';

const TICKS = Array.from({ length: 48 }, (_, i) => i);

export default function ArchiveLoadingScreen() {
  return (
    <div className={styles.screen} role="status" aria-label="正在打开档案馆">
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.dust} aria-hidden="true" />

      <div className={styles.core}>
        <p className={styles.eyebrow}>INON / FIELD ARCHIVE / 2026</p>

        <div className={styles.dial} aria-hidden="true">
          <svg viewBox="0 0 120 120" className={styles.dialSvg}>
            <g className={styles.rose}>
              <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(197, 177, 111, 0.4)" strokeWidth="0.75" />
              <circle cx="60" cy="60" r="44" fill="none" stroke="rgba(197, 177, 111, 0.22)" strokeWidth="0.5" />
              {TICKS.map((tick) => (
                <line
                  key={tick}
                  x1="60"
                  y1="6"
                  x2="60"
                  y2={tick % 12 === 0 ? 14 : 10}
                  stroke={tick % 12 === 0 ? 'rgba(197, 177, 111, 0.55)' : 'rgba(197, 177, 111, 0.28)'}
                  strokeWidth={tick % 12 === 0 ? 0.9 : 0.5}
                  transform={`rotate(${tick * 7.5} 60 60)`}
                />
              ))}
              <text x="60" y="27" textAnchor="middle" className={styles.cardinal}>N</text>
              <text x="94" y="63" textAnchor="middle" className={styles.cardinal}>E</text>
              <text x="60" y="99" textAnchor="middle" className={styles.cardinal}>S</text>
              <text x="26" y="63" textAnchor="middle" className={styles.cardinal}>W</text>
            </g>
            <g className={styles.needle}>
              <polygon points="60,20 63.2,60 56.8,60" fill="#b58a43" />
              <polygon points="60,100 63.2,60 56.8,60" fill="#763e32" />
            </g>
            <circle cx="60" cy="60" r="2.4" fill="#c9bd91" />
          </svg>
        </div>

        <h1 className={styles.title}>正在开启这座档案馆</h1>

        <p className={styles.coords}>
          X <span className={styles.coordsDash}>——·——</span> / Z <span className={styles.coordsDash}>——·——</span>
          <span className={styles.coordsSep}>·</span>ALT <span className={styles.coordsDash}>——</span> M
          <span className={styles.coordsSep}>·</span>信号校准中
        </p>

        <div className={styles.rule} aria-hidden="true">
          <span className={styles.ruleScan} />
        </div>

        <div className={styles.statuses} aria-hidden="true">
          <span className={styles.status}>翻阅馆藏索引</span>
          <span className={styles.status}>点亮标本桌的灯</span>
          <span className={styles.status}>接通林间电台</span>
        </div>
      </div>
    </div>
  );
}
