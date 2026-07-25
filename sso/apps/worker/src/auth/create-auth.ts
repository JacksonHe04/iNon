import { normalizeUsername, validateUsername } from "@inon/sso-contracts";
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { emailOTP, jwt, username } from "better-auth/plugins";
import type { Env } from "../env";
import {
  AUTH_BASE_PATH,
  AUTH_BASE_URL,
  CANONICAL_ORIGIN,
  GITHUB_CALLBACK_URL,
  SESSION_SLIDING_TTL_SECONDS,
} from "./constants";
import { normalizeEmail } from "./email";
import {
  createGitHubUserInfoResolver,
  stripUpstreamProviderTokens,
} from "./github";
import {
  SESSION_ADDITIONAL_FIELDS,
  USER_ADDITIONAL_FIELDS,
} from "./schema";
import { capSessionExpiration } from "./session-policy";

export interface VerificationOTPMessage {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}

export interface AuthDependencies {
  sendVerificationOTP(message: VerificationOTPMessage): Promise<void>;
  runInBackground?(promise: Promise<unknown>): void;
}

export function createAuth(env: Env, dependencies: AuthDependencies) {
  return betterAuth({
    appName: "iNon",
    baseURL: AUTH_BASE_URL,
    basePath: AUTH_BASE_PATH,
    secret: env.BETTER_AUTH_SECRET,
    database: env.DB,
    trustedOrigins: [CANONICAL_ORIGIN],
    ...(dependencies.runInBackground
      ? {
          advanced: {
            backgroundTasks: {
              handler: dependencies.runInBackground,
            },
          },
        }
      : {}),
    disabledPaths: [
      "/sign-up/email",
      "/is-username-available",
      "/update-user",
    ],
    hooks: {
      before: createAuthMiddleware(async (context) => {
        const body = context.body as Record<string, unknown> | undefined;
        if (body && typeof body.email === "string") {
          body.email = normalizeEmail(body.email);
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => ({
            data: {
              ...user,
              email: normalizeEmail(user.email),
            },
          }),
        },
      },
      session: {
        update: {
          before: async (session, context) => {
            const absoluteValue =
              context?.context.session?.session.absoluteExpiresAt;
            if (!session.expiresAt || !absoluteValue) {
              return;
            }

            const expiresAt = new Date(session.expiresAt);
            const absoluteExpiresAt = new Date(
              absoluteValue as string | Date,
            );
            return {
              data: {
                ...session,
                expiresAt: capSessionExpiration(
                  expiresAt,
                  absoluteExpiresAt,
                ),
              },
            };
          },
        },
      },
      account: {
        create: {
          before: async (account) => ({
            data: stripUpstreamProviderTokens(account),
          }),
        },
        update: {
          before: async (account) => ({
            data: stripUpstreamProviderTokens(account),
          }),
        },
      },
    },
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
    verification: {
      storeIdentifier: "hashed",
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["github"],
        allowDifferentEmails: true,
        allowUnlinkingAll: false,
      },
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        redirectURI: GITHUB_CALLBACK_URL,
        getUserInfo: createGitHubUserInfoResolver(env.DB),
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
        sendVerificationOTP: async (message, context) => {
          try {
            await dependencies.sendVerificationOTP(message);
          } catch (error) {
            await context?.context.internalAdapter.deleteVerificationByIdentifier(
              `${message.type}-otp-${message.email}`,
            );
            throw error;
          }
        },
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
        silenceWarnings: {
          oauthAuthServerConfig: true,
          openidConfig: true,
        },
      }),
    ],
  });
}
