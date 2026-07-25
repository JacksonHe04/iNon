import { oauthProvider } from "@better-auth/oauth-provider";
import { AUTH_BASE_URL } from "../auth/constants";
import {
  PROJECT_CLAIM,
  PROJECT_ROLE_CLAIM,
  projectClaimsFromAccessToken,
  resolveProjectIdentityClaims,
} from "./claims";

const TEN_MINUTES_SECONDS = 10 * 60;
const NINETY_DAYS_SECONDS = 90 * 24 * 60 * 60;

export function createFirstPartyOAuthProvider(db: D1Database) {
  return oauthProvider({
    loginPage: "/sso/login",
    consentPage: "/sso/consent",
    scopes: ["openid", "profile", "email", "offline_access"],
    grantTypes: ["authorization_code", "refresh_token"],
    validAudiences: [AUTH_BASE_URL],
    allowDynamicClientRegistration: false,
    allowUnauthenticatedClientRegistration: false,
    storeClientSecret: "hashed",
    storeTokens: "hashed",
    accessTokenExpiresIn: TEN_MINUTES_SECONDS,
    idTokenExpiresIn: TEN_MINUTES_SECONDS,
    refreshTokenExpiresIn: NINETY_DAYS_SECONDS,
    codeExpiresIn: 5 * 60,
    customIdTokenClaims: ({ user, metadata }) =>
      resolveProjectIdentityClaims(db, user, metadata),
    customAccessTokenClaims: ({ user, metadata }) =>
      user
        ? resolveProjectIdentityClaims(db, user, metadata)
        : Promise.resolve({}),
    customUserInfoClaims: ({ jwt }) =>
      projectClaimsFromAccessToken(jwt as Record<string, unknown>),
    advertisedMetadata: {
      scopes_supported: ["openid", "profile", "email", "offline_access"],
      claims_supported: [
        "sub",
        "email",
        "email_verified",
        "preferred_username",
        PROJECT_CLAIM,
        PROJECT_ROLE_CLAIM,
      ],
    },
    silenceWarnings: {
      oauthAuthServerConfig: true,
      openidConfig: true,
    },
  });
}
