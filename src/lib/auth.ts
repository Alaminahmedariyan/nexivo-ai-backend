import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, twoFactor } from "better-auth/plugins";

import { prisma } from "./prisma";
import config from "../app/config";
import { sendEmail } from "../app/utils/sendEmail";

import {
  verificationEmailTemplate,
  resetPasswordEmailTemplate,
} from "../app/utils/emailTemplates";

export const auth = betterAuth({
  // =========================================================
  // Database
  // =========================================================
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // =========================================================
  // Better Auth URL
  // =========================================================
  baseURL: config.betterAuth.url,

  // =========================================================
  // Trusted Origins
  // =========================================================
  trustedOrigins: [
    config.app.clientUrl,

    ...(config.app.env !== "production"
      ? [
          "http://localhost:3000",
          "http://localhost:5173",
        ]
      : []),
  ],

  // =========================================================
  // User
  // =========================================================
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

  // =========================================================
  // Email + Password Authentication
  // =========================================================
  emailAndPassword: {
    enabled: true,

    // Production-এ email verification required থাকবে
    requireEmailVerification: config.app.env === "production",

    // =======================================================
    // Password Reset Email
    // =======================================================
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

  // =========================================================
  // Email Verification
  // =========================================================
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

    // Registration-এর পর verification email পাঠাবে
    sendOnSignUp: true,

    // Verification successful হলে automatically sign in করবে
    autoSignInAfterVerification: true,
  },

  // =========================================================
  // OAuth / Social Login
  // =========================================================
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

  // =========================================================
  // Session
  // =========================================================
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  // =========================================================
  // Security / Cookies
  // =========================================================
  advanced: {
    useSecureCookies: config.app.env === "production",

    defaultCookieAttributes: {
      sameSite: config.app.env === "production" ? "none" : "lax",
      secure: config.app.env === "production",
    },
  },

  // =========================================================
  // Plugins
  // =========================================================
  plugins: [
    bearer(),

    twoFactor({
      issuer: "Nexivo AI",
    }),
  ],
});