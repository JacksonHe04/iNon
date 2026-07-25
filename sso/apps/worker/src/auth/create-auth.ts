import { normalizeUsername, validateUsername } from "@inon/sso-contracts";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { emailOTP, jwt, username } from "better-auth/plugins";
import type { Env } from "../env";
import {
  AUTH_BASE_PATH,
  AUTH_BASE_URL,
  CANONICAL_ORIGIN,
  GITHUB_CALLBACK_URL,
  SESSION_SLIDING_TTL_SECONDS,
} from "./constants";
import {
  SESSION_ADDITIONAL_FIELDS,
  USER_ADDITIONAL_FIELDS,
} from "./schema";

export interface VerificationOTPMessage {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}

export interface AuthDependencies {
  sendVerificationOTP(message: VerificationOTPMessage): Promise<void>;
}

export function createAuth(env: Env, dependencies: AuthDependencies) {
  return betterAuth({
    appName: "iNon",
    baseURL: AUTH_BASE_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    database: env.DB,
    trustedOrigins: [CANONICAL_ORIGIN],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      requireEmailVerification: true,
    },
    user: {
      additionalFields: USER_ADDITIONAL_FIELDS,
      deleteUser: {
        enabled: false,
      },
    },
    session: {
      expiresIn: SESSION_SLIDING_TTL_SECONDS,
      updateAge: 24 * 60 * 60,
      additionalFields: SESSION_ADDITIONAL_FIELDS,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        redirectURI: GITHUB_CALLBACK_URL,
      },
    },
    plugins: [
      username({
        minUsernameLength: 1,
        maxUsernameLength: 30,
        usernameValidator: (value) => validateUsername(value).success,
        displayUsernameValidator: (value) => validateUsername(value).success,
        usernameNormalization: normalizeUsername,
        displayUsernameNormalization: normalizeUsername,
        validationOrder: {
          username: "post-normalization",
          displayUsername: "post-normalization",
        },
      }),
      emailOTP({
        sendVerificationOTP: (message) =>
          dependencies.sendVerificationOTP(message),
        expiresIn: 10 * 60,
        allowedAttempts: 5,
        storeOTP: "hashed",
        resendStrategy: "rotate",
        disableSignUp: false,
      }),
      jwt({
        jwt: {
          issuer: AUTH_BASE_URL,
          audience: AUTH_BASE_URL,
          expirationTime: 10 * 60,
        },
        disableSettingJwtHeader: true,
      }),
      oauthProvider({
        loginPage: "/sso/login",
        consentPage: "/sso/consent",
        scopes: ["openid", "profile", "email", "offline_access"],
        grantTypes: ["authorization_code", "refresh_token"],
        validAudiences: [AUTH_BASE_URL],
        allowDynamicClientRegistration: false,
        allowUnauthenticatedClientRegistration: false,
        storeClientSecret: "hashed",
        storeTokens: "hashed",
      }),
    ],
  });
}
