'use client';

import { useEffect } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import type { ReadmeData } from '@/types';
import { buildHomeRecord, type HomeRecordId } from '@/components/world/archiveHomeRecords';

export default function ArchiveHomeRecordPanel({
  data,
  recordId,
  onClose,
}: {
  data: ReadmeData;
  recordId: HomeRecordId;
  onClose: () => void;
}) {
  const record = buildHomeRecord(data, recordId);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.code === 'Escape') onClose();
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  return (
    <aside className={`archive-home-record is-${record.id}`} aria-label={record.title}>
      <button className="archive-home-record__close" onClick={onClose} aria-label="合上档案"><X /></button>
      <header>
        <span>{record.folio}</span>
        <h2>{record.title}</h2>
        <p>{record.subtitle}</p>
      </header>
      <blockquote>{record.annotation}</blockquote>
      {record.entries.length ? (
        <div className="archive-home-record__entries">
          {record.entries.map((entry, index) => {
            const content = (
              <>
                {entry.imageUrl && <img src={entry.imageUrl} alt="" />}
                <span>{String(index + 1).padStart(2, '0')} · {entry.meta}</span>
                <h3>{entry.title}</h3>
                <p>{entry.body || '这条记录没有留下批注。'}</p>
                {!!entry.tags?.length && <small>{entry.tags.slice(0, 5).join(' / ')}</small>}
                {entry.href && <ArrowUpRight aria-hidden="true" />}
              </>
            );
            return entry.href ? (
              <a key={`${entry.title}-${index}`} href={entry.href} target="_blank" rel="noreferrer">{content}</a>
            ) : (
              <article key={`${entry.title}-${index}`}>{content}</article>
            );
          })}
        </div>
      ) : (
        <p className="archive-home-record__empty">还没有任何记录。家具仍在等第一张纸。</p>
      )}
      <footer>点击家具读取 · ESC 合上 · 世界仍在窗外</footer>
    </aside>
  );
}
