interface ArchiveHeroProps {
  title?: string;
  description?: string;
}

export default function ArchiveHero({
  title = 'Verdant Archive',
  description = '一座由个人经历、偏好与创造组成的数字档案。',
}: ArchiveHeroProps) {
  return (
    <section className="archive-hero" aria-labelledby="archive-hero-title">
      <div className="archive-hero__image" aria-hidden="true" />
      <div className="archive-hero__copy">
        <p className="archive-kicker">iNon · personal field notes</p>
        <h1 id="archive-hero-title">{title}</h1>
        <p>{description}</p>
      </div>
      <div className="archive-hero__stamp" aria-hidden="true">
        <span>私人档案</span>
        <strong>NO. 01</strong>
      </div>
    </section>
  );
}
