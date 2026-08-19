import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { siteSettingService } from "./siteSetting.service";
import type { SettingGroup } from "../../../../generated/prisma/enums";

const getAllSettings = catchAsync(async (req: Request, res: Response) => {
  const settings = await siteSettingService.getAllSettings(req.query.group as SettingGroup | undefined);
  res.status(StatusCodes.OK).json({ success: true, message: "Settings retrieved successfully.", data: settings });
});

const getSettingByKey = catchAsync(async (req: Request, res: Response) => {
  const setting = await siteSettingService.getSettingByKey(req.params.key as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Setting retrieved successfully.", data: setting });
});

const upsertSetting = catchAsync(async (req: Request, res: Response) => {
  const setting = await siteSettingService.upsertSetting(req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Setting saved successfully.", data: setting });
});

const deleteSetting = catchAsync(async (req: Request, res: Response) => {
  await siteSettingService.deleteSetting(req.params.key as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Setting deleted successfully.", data: null });
});

export const siteSettingController = { getAllSettings, getSettingByKey, upsertSetting, deleteSetting };