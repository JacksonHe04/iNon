'use client';

import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { HomeExhibit } from '@/components/world/archiveHomeRecords';
import styles from '@/components/world/ArchiveHomeExhibitPanel.module.css';

const KIND_COPY = {
  music: { folio: 'NOW SPINNING', type: 'PRIVATE RECORD', action: '打开唱片来源' },
  film: { folio: 'PRIVATE SCREENING', type: 'FILM ARCHIVE', action: '打开影片来源' },
  book: { folio: 'OPEN VOLUME', type: 'BOOKSHELF COPY', action: '打开书目来源' },
} as const;

export default function ArchiveHomeExhibitPanel({
  exhibit,
  onClose,
}: {
  exhibit: HomeExhibit;
  onClose: () => void;
}) {
  const copy = KIND_COPY[exhibit.kind];
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.code === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);
  return (
    <aside className={styles.stage} data-kind={exhibit.kind} aria-label={`${exhibit.title} 的屋内藏品检视`}>
      <div className={styles.ambient} aria-hidden="true"><img src={exhibit.imageUrl} alt="" /></div>
      <button className={styles.close} onClick={onClose} aria-label="放回藏品"><X /></button>
      <figure className={styles.artwork}>
        <span>{copy.folio}</span>
        <img src={exhibit.imageUrl} alt={`${exhibit.title} 封面`} />
        <figcaption>真实收藏封面 · 点击前位于主屋陈列中</figcaption>
      </figure>
      <section className={styles.liner}>
        <span>{copy.type} / {exhibit.categoryName || 'UNCATEGORISED'}</span>
        <h2>{exhibit.title}</h2>
        <p>{exhibit.creator}</p>
        <blockquote>{exhibit.comment || '这件收藏没有留下批注。'}</blockquote>
        {exhibit.href && (
          <a href={exhibit.href} target="_blank" rel="noreferrer">
            {copy.action}<ArrowUpRight aria-hidden="true" />
          </a>
        )}
        <small>ESC 放回 · 世界仍停留在这张封面前</small>
      </section>
    </aside>
  );
}
