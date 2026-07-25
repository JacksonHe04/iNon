import { createBootstrapHeaders } from "./lib/bootstrap-request.mjs";

const endpoint = new URL(
  "/api/sso/internal/super-admin/bootstrap",
  process.env.INON_SSO_WORKER_URL ?? "https://inon.space",
);
const email = process.env.INON_SSO_SUPER_ADMIN_EMAIL;

if (!email) {
  throw new Error("INON_SSO_SUPER_ADMIN_EMAIL is required.");
}

const response = await fetch(endpoint, {
  method: "POST",
  headers: createBootstrapHeaders({
    accept: "application/json",
    "content-type": "application/json",
  }),
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
