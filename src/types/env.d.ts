declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";

      PORT?: string;
      CLIENT_URL: string;
      DATABASE_URL: string;

      BETTER_AUTH_SECRET: string;
      BETTER_AUTH_URL: string;

      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;

      GITHUB_CLIENT_ID?: string;
      GITHUB_CLIENT_SECRET?: string;

      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;

      RESEND_API_KEY: string;
      EMAIL_FROM: string;

      // Optional — no billing module wired up yet.
      STRIPE_PRODUCT_ID?: string;
      STRIPE_SECRET_KEY?: string;
      STRIPE_WEBHOOK_SECRET?: string;

      SUPER_ADMIN_EMAIL: string;
      SUPER_ADMIN_PASSWORD: string;
      SUPER_ADMIN_NAME?: string;
    }
  }
}

export {};