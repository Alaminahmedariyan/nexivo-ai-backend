import type { UserRole } from "../../../../generated/prisma/enums";

export type UpdateProfileInput = Partial<{
  name: string;
  phone: string;
  image: string;
}>;

export type UserQuery = Record<string, unknown>;