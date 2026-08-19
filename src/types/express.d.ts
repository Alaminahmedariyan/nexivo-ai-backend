import type { UserRole } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        role: UserRole;
        phone: string | null;
        isActive: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
      };

      // Set by requireApiKey middleware for machine-to-machine requests
      // (n8n / LangFlow / Zapier webhook calls) that authenticate via
      // x-api-key instead of a user session.
      apiKeyName?: string;

      files?: Express.Multer.File[];
    }
  }
}

export {};