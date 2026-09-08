import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  bearer,
  twoFactor,
  emailOTP,
  multiSession,
  lastLoginMethod,
  oauthPopup,
} from "better-auth/plugins";

import { prisma } from "./prisma";
import { redis } from "./redis";
import config from "../app/config";
import { sendEmail } from "../app/utils/sendEmail";

import {
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
  otpEmailTemplate,
} from "../app/utils/emailTemplates";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: config.betterAuth.url,

  trustedOrigins: [
    config.app.clientUrl,
    config.betterAuth.url,

    ...(config.app.env !== "production"
      ? [
          "http://localhost:3000",
          "http://localhost:5173",
        ]
      : []),
  ],

  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github"],
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
        input: true,
      },

      phone: {
        type: "string",
        required: false,
        input: true,
      },

      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },

      lastLoginAt: {
        type: "date",
        required: false,
        input: false,
      },

      deletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },

  emailAndPassword: {
    enabled: true,

    requireEmailVerification: config.app.env === "production",

    sendResetPassword: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Nexivo AI password",
        html: resetPasswordEmailTemplate(user.name, url),
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Nexivo AI account",
        html: verificationEmailTemplate(user.name, url),
      });
    },

    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  account: {
    storeStateStrategy: "database",
    skipStateCookieCheck: true,
  },

  socialProviders: {
    google: {
      clientId: config.oauth.google.clientId!,
      clientSecret: config.oauth.google.clientSecret!,
    },

    github: {
      clientId: config.oauth.github.clientId!,
      clientSecret: config.oauth.github.clientSecret!,
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  advanced: {
    useSecureCookies: config.app.env === "production",

    defaultCookieAttributes: {
      sameSite: config.app.env === "production" ? "none" : "lax",
      secure: config.app.env === "production",
      httpOnly: true,
    },
  },

  secondaryStorage: config.redis.url
    ? {
        get: async (key) => {
          const value = await redis.get(`nexivo:${key}`);
          return value ?? null;
        },
        getAndDelete: async (key) => {
          const value = await redis.getdel(`nexivo:${key}`);
          return value ?? null;
        },
        set: async (key, value, ttl) => {
          if (ttl) await redis.setex(`nexivo:${key}`, ttl, value as string);
          else await redis.set(`nexivo:${key}`, value as string);
        },
        delete: async (key) => {
          await redis.del(`nexivo:${key}`);
        },
        increment: async (key, ttl) => {
          const current = await redis.incr(`nexivo:${key}`);
          if (current === 1 && ttl) {
            await redis.expire(`nexivo:${key}`, ttl);
          }
          return current;
        },
      }
    : undefined,

  plugins: [
    bearer(),

    twoFactor({
      issuer: "Nexivo AI",
    }),

    emailOTP({
      sendVerificationOTP: async ({ email, otp, type }) => {
        await sendEmail({
          to: email,
          subject: "Your Nexivo AI verification code",
          html: otpEmailTemplate("User", otp, type),
        });
      },
      sendVerificationOnSignUp: true,
      disableSignUp: false,
      expiresIn: 300,
      otpLength: 6,
      allowedAttempts: 3,
      storeOTP: "plain",
      rateLimit: {
        window: 60,
        max: 3,
      },
    }),

    multiSession({
      maximumSessions: 5,
    }),

    lastLoginMethod({}),

    oauthPopup(),
  ],
});