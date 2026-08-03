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

export default function ArchiveAtmosphere({ profile = false }: { profile?: boolean }) {
  return (
    <div
      className={`archive-atmosphere${profile ? ' archive-atmosphere--profile' : ''}`}
      aria-hidden="true"
    >
      <div className="archive-atmosphere__landscape" />
      {profile ? <div className="archive-atmosphere__wood" /> : null}
      <div className="archive-atmosphere__paper" />
      <div className="archive-atmosphere__grain" />
      {profile ? (
        <>
          <div className="archive-atmosphere__dust" />
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
