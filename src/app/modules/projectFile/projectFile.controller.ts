import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";
import AppError from "../../errors/appError";

import { projectFileService } from "./projectFile.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

// ======================================================
// UPLOAD FILE
// ======================================================

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "No file was uploaded.",
    );
  }

  const currentUser = req.user as AuthenticatedUser;

  const file = await projectFileService.uploadFile(
    req.params.projectId as string,
    currentUser.id,
    req.file,
  );

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "File uploaded successfully.",
    data: file,
  });
});

// ======================================================
// GET PROJECT FILES
// ======================================================

const getFilesByProject = catchAsync(
  async (req: Request, res: Response) => {
    const files = await projectFileService.getFilesByProject(
      req.params.projectId as string,
      req.query,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Files retrieved successfully.",
      data: files.data,
      meta: files.meta,
    });
  },
);

// ======================================================
// DELETE FILE
// ======================================================

const deleteFile = catchAsync(async (req: Request, res: Response) => {
  await projectFileService.deleteFile(
    req.params.fileId as string,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "File deleted successfully.",
    data: null,
  });
});

export const projectFileController = {
  uploadFile,
  getFilesByProject,
  deleteFile,
};