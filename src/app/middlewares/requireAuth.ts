import { type NextFunction, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../../lib/auth";
import AppError from "../errors/appError";
import { catchAsync } from "../utils/catchAsync";
import type { UserRole } from "../../../generated/prisma";

// ──────────────────────────────────────────
// Type for the authenticated user attached
// to Express Request by Better Auth
// ──────────────────────────────────────────
export interface AuthenticatedUser {
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
}

// ──────────────────────────────────────────
// requireAuth — verifies the Better Auth
// session from the request headers / cookies
// ──────────────────────────────────────────
export const requireAuth = catchAsync(
  async (req: Request, _res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({
      // Better Auth expects the Web API `Headers` type, not Express/Node's
      // plain IncomingHttpHeaders object — fromNodeHeaders converts it.
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authorized. Please sign in.",
      );
    }

    if ((session.user as AuthenticatedUser).deletedAt) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "This account has been deleted.",
      );
    }

    if (!(session.user as AuthenticatedUser).isActive) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "Your account has been deactivated.",
      );
    }

    req.user = session.user as AuthenticatedUser;
    next();
  },
);

// ──────────────────────────────────────────
// requireRole — restricts access to specific
// roles. Must be used AFTER requireAuth.
// ──────────────────────────────────────────
export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized.");
    }

    if (!allowedRoles.includes((req.user as AuthenticatedUser).role)) {
      throw new AppError(
        StatusCodes.FORBIDDEN,
        "You do not have permission to access this resource.",
      );
    }

    next();
  };
