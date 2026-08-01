import type { ComponentType } from 'react';

interface ArchiveSectionHeadingProps {
  title: string;
  count?: number | string;
  countLabel?: string;
  icon?: ComponentType<{ className?: string }>;
  eyebrow?: string;
}

export default function ArchiveSectionHeading({
  title,
  count,
  countLabel = 'RECORDS',
  icon: Icon,
  eyebrow = 'INON ARCHIVE',
}: ArchiveSectionHeadingProps) {
  return (
    <header className="archive-section-heading">
      <div className="archive-section-heading__mark" aria-hidden="true">
        {Icon ? <Icon className="h-4 w-4" /> : <span>✦</span>}
      </div>
      <div className="min-w-0">
        <p className="archive-kicker">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      {count !== undefined && (
        <p className="archive-section-heading__count">
          <span>{String(count).padStart(2, '0')}</span>
          {countLabel}
        </p>
      )}
    </header>
  );
}
