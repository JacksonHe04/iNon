interface SsoHandoffProps {
  description: string;
  title: string;
}

export function SsoHandoff({
  description,
  title,
}: SsoHandoffProps) {
  return (
    <div className="sso-form sso-handoff" role="status" aria-live="polite">
      <div className="sso-handoff-spinner" aria-hidden="true">
        <span />
      </div>
      <p className="sso-kicker">Secure handoff</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="sso-handoff-progress" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
