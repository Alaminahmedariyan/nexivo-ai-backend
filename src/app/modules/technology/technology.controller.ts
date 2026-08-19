import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { technologyService } from "./technology.service";

const createTechnology = catchAsync(async (req: Request, res: Response) => {
  const technology = await technologyService.createTechnology(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Technology created successfully.", data: technology });
});

const getAllTechnologies = catchAsync(async (_req: Request, res: Response) => {
  const technologies = await technologyService.getAllTechnologies();
  res.status(StatusCodes.OK).json({ success: true, message: "Technologies retrieved successfully.", data: technologies });
});

const updateTechnology = catchAsync(async (req: Request, res: Response) => {
  const technology = await technologyService.updateTechnology(req.params.id as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Technology updated successfully.", data: technology });
});

const deleteTechnology = catchAsync(async (req: Request, res: Response) => {
  await technologyService.deleteTechnology(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Technology deleted successfully.", data: null });
});

export const technologyController = { createTechnology, getAllTechnologies, updateTechnology, deleteTechnology };