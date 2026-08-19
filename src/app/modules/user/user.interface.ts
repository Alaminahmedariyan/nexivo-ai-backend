import type { UserRole } from "../../../../generated/prisma";

export type UpdateProfileInput = Partial<{
  name: string;
  phone: string;
  image: string;
}>;

export type UserQuery = Record<string, unknown>;
