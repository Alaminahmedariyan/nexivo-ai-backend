import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { bearer, twoFactor } from "better-auth/plugins";
import { prisma } from "./prisma";
import config from "../app/config";
import { sendEmail } from "../app/utils/sendEmail";
import { verificationEmailTemplate, resetPasswordEmailTemplate } from "../app/utils/emailTemplates";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { 
    provider: "postgresql" 
  }),

  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "USER", input: true },
      phone: { type: "string", required: false, input: true },
      isActive: { type: "boolean", required: true, defaultValue: true, input: false },
      lastLoginAt: { type: "date", required: false, input: false },
      deletedAt: { type: "date", required: false, input: false },
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: config.app.env === "production",
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Nexivo AI password",
        html: resetPasswordEmailTemplate(user.name, url),
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Nexivo AI account",
        html: verificationEmailTemplate(user.name, url),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  socialProviders: {
    google: {
      clientId: config.oauth.google.clientId || "dummy_client_id",
      clientSecret: config.oauth.google.clientSecret || "dummy_client_secret",
    },
    github: {
      clientId: config.oauth.github.clientId || "dummy_client_id",
      clientSecret: config.oauth.github.clientSecret || "dummy_client_secret",
    },
  },

  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  trustedOrigins: [config.app.clientUrl || "http://localhost:3000"],

  advanced: {
    disableCSRFCheck: true,
    useSecureCookies: config.app.env === "production",
    defaultCookieAttributes: {
      sameSite: config.app.env === "production" ? "none" : "lax",
      secure: config.app.env === "production",
    },
  },

  plugins: [
    bearer(),
    twoFactor({
      issuer: "Nexivo AI",
    }),
  ],
});