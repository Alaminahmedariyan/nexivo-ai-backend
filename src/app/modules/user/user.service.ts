import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import type { UpdateProfileInput } from "./user.interface";
import { UserRole } from "../../../../generated/prisma";
import { QueryBuilder } from "../../query-builder";
import { Prisma } from "../../../../generated/prisma/client";
import { USER_PUBLIC_SELECT } from "./user.const";
import { fileUploader } from "../../config/cloudinary";

const getAllUsers = async (query: Record<string, unknown>) => {
  return userQueryBuilder.execute(query);
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: {
      ...USER_PUBLIC_SELECT,
      clientProfile: { select: { id: true, companyName: true } },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return user;
};

const updateProfile = async (
  id: string,
  payload: UpdateProfileInput,
  file?: Express.Multer.File,
) => {
  const existing = await prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  const updateData: UpdateProfileInput = {
    ...payload,
  };

  if (file) {
    const uploadedImage = await fileUploader.uploadFileToCloudinary(
      file.buffer,
      file.originalname,
      "nexivo-ai/avatars",
    );

    updateData.image = uploadedImage.secure_url;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
    },
  });
};

const updateRole = async (id: string, role: UserRole, actorRole: UserRole) => {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  // Only a SUPER_ADMIN can grant or revoke SUPER_ADMIN privileges —
  // otherwise a compromised/rogue ADMIN account could self-escalate.
  if (
    (role === "SUPER_ADMIN" || existing.role === "SUPER_ADMIN") &&
    actorRole !== "SUPER_ADMIN"
  ) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "Only a Super Admin can assign or modify Super Admin privileges.",
    );
  }

  return prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
};

const updateStatus = async (id: string, isActive: boolean) => {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: { id: true, name: true, email: true, isActive: true },
  });
};

const softDeleteUser = async (id: string) => {
  const existing = await prisma.user.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
};

const userQueryBuilder = new QueryBuilder<
  Prisma.UserGetPayload<{
    select: typeof USER_PUBLIC_SELECT;
  }>,
  Prisma.UserWhereInput
>(prisma.user, {
  searchableFields: ["name", "email", "phone"],

  filterableFields: {
    role: {
      type: "enum",
      enum: UserRole,
    },

    isActive: "boolean",

    createdAt: "date",
  },

  sortableFields: ["createdAt", "name", "email"],

  selectableFields: Object.keys(USER_PUBLIC_SELECT),

  softDelete: true,

  defaultSortField: "createdAt",
});

export const userService = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateRole,
  updateStatus,
  softDeleteUser,
};
