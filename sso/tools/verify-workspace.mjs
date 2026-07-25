import { readFile } from "node:fs/promises";

const root = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const worker = JSON.parse(
  await readFile(new URL("../apps/worker/package.json", import.meta.url), "utf8"),
);
const contracts = JSON.parse(
  await readFile(
    new URL("../packages/contracts/package.json", import.meta.url),
    "utf8",
  ),
);

if (root.private !== true) {
  throw new Error("SSO workspace must remain private");
}

if (worker.name !== "@inon-sso/worker") {
  throw new Error("Worker package name mismatch");
}

if (contracts.name !== "@inon/sso-contracts") {
  throw new Error("Contracts package name mismatch");
}
