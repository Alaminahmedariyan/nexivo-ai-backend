import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { timelineService } from "./timeline.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

const createEntry = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;

  const entry = await timelineService.createEntry(
    req.params.projectId as string,
    currentUser.id,
    req.body,
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Timeline entry added.",
    data: entry,
  });
});

const getByProject = catchAsync(async (req: Request, res: Response) => {
  const entries = await timelineService.getByProject(
    req.params.projectId as string,
    req.query,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Timeline retrieved successfully.",
    data: entries,
  });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const entry = await timelineService.getById(
    req.params.projectId as string,
    req.params.timelineId as string,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Timeline entry retrieved successfully.",
    data: entry,
  });
});

const updateEntry = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;

  const entry = await timelineService.updateEntry(
    req.params.projectId as string,
    req.params.timelineId as string,
    currentUser.id,
    req.body,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Timeline entry updated successfully.",
    data: entry,
  });
});

const deleteEntry = catchAsync(async (req: Request, res: Response) => {
  await timelineService.deleteEntry(
    req.params.projectId as string,
    req.params.timelineId as string,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Timeline entry deleted successfully.",
    data: null,
  });
});

export const timelineController = {
  createEntry,
  getByProject,
  getById,
  updateEntry,
  deleteEntry,
};