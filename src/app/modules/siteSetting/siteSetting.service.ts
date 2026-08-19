import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import type { SettingGroup } from "../../../../generated/prisma";
import type { UpsertSettingInput } from "./siteSetting.interface";

const getAllSettings = async (group?: SettingGroup) => {
  return prisma.siteSetting.findMany({
    where: group ? { group } : undefined,
    orderBy: { key: "asc" },
  });
};

const getSettingByKey = async (key: string) => {
  const setting = await prisma.siteSetting.findUnique({ where: { key } });
  if (!setting) {
    throw new AppError(StatusCodes.NOT_FOUND, "Setting not found.");
  }
  return setting;
};

// Upsert by key — a single admin-facing endpoint handles both create and
// update, since a "site setting" is conceptually always just one value per key.
const upsertSetting = async (payload: UpsertSettingInput) => {
  return prisma.siteSetting.upsert({
    where: { key: payload.key },
    create: {
      key: payload.key,
      value: payload.value as Prisma.InputJsonValue,
      group: payload.group,
    },
    update: {
      value: payload.value as Prisma.InputJsonValue,
      group: payload.group,
    },
  });
};

const deleteSetting = async (key: string) => {
  const existing = await prisma.siteSetting.findUnique({ where: { key } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Setting not found.");
  }

  await prisma.siteSetting.delete({ where: { key } });
};

export const siteSettingService = {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
};
