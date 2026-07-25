const endpoint = new URL(
  "/api/sso/internal/super-admin/bootstrap",
  process.env.INON_SSO_WORKER_URL ?? "https://inon.space",
);
const internalToken = process.env.INON_SSO_INTERNAL_TOKEN;
const email = process.env.INON_SSO_SUPER_ADMIN_EMAIL;

if (!internalToken) {
  throw new Error("INON_SSO_INTERNAL_TOKEN is required.");
}
if (!email) {
  throw new Error("INON_SSO_SUPER_ADMIN_EMAIL is required.");
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    accept: "application/json",
    authorization: `Bearer ${internalToken}`,
    "content-type": "application/json",
  },
  body: JSON.stringify({ email }),
});
if (!response.ok) {
  throw new Error(
    `Super administrator bootstrap failed with HTTP ${response.status}.`,
  );
}

const payload = await response.json();
if (payload.globalRole !== "super_admin" || !payload.userId) {
  throw new Error("Super administrator bootstrap returned an invalid result.");
}

console.log(
  `Bound the sole global super administrator to user ${payload.userId}.`,
);
