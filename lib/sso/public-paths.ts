function publicSsoPath(
  action: "end" | "refresh" | "start",
  returnTo: string,
): string {
  return `/sso/${action}?${new URLSearchParams({ returnTo })}`;
}

export function inonLoginPath(returnTo = "/"): string {
  return publicSsoPath("start", returnTo);
}

export function inonLogoutPath(returnTo = "/"): string {
  return publicSsoPath("end", returnTo);
}

export function inonRefreshPath(returnTo = "/"): string {
  return publicSsoPath("refresh", returnTo);
}
