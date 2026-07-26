import {
  projectKeySchema,
  projectKeys,
  type ProjectKey,
} from "@inon/sso-contracts";
import { z } from "zod";
import { PROJECT_REDIRECT_URIS } from "../auth/constants";

export interface FirstPartyClient {
  name: string;
  project: ProjectKey;
  redirectUris: readonly [string, ...string[]];
}

const CLIENT_NAMES = {
  inon: "iNon",
  leaf: "Leaf",
  pine: "PINE",
  sayless: "SAYLESS",
  treez: "Treez",
} as const satisfies Record<ProjectKey, string>;

export const FIRST_PARTY_CLIENTS = projectKeys.map(
  (project): FirstPartyClient => ({
    name: CLIENT_NAMES[project],
    project,
    redirectUris: PROJECT_REDIRECT_URIS[project],
  }),
);

const firstPartyClientMetadataSchema = z
  .object({
    project: projectKeySchema,
  })
  .strict();

export function parseFirstPartyClientProject(
  metadata: unknown,
): ProjectKey {
  return firstPartyClientMetadataSchema.parse(metadata).project;
}

export function serializeFirstPartyClientMetadata(
  project: ProjectKey,
): string {
  return JSON.stringify({ project });
}
