export function inonProjectOrigin(): string {
  return (
    process.env.INON_SSO_PUBLIC_ORIGIN ??
    (process.env.NODE_ENV === "production"
      ? "https://inon.space"
      : "http://localhost:3000")
  );
}
