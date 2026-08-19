import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";

import type { AuthenticatedUser } from "../../middlewares/requireAuth";
import { userService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers(
    req.query as Record<string, unknown>,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Users retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User retrieved successfully.",
    data: user,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(
    (req.user as AuthenticatedUser).id,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile retrieved successfully.",
    data: user,
  });
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(
    (req.user as AuthenticatedUser).id,
    req.body,
    req.file,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Profile updated successfully.",
    data: user,
  });
});

const updateRole = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;

  const user = await userService.updateRole(
    req.params.id as string,
    req.body.role,
    currentUser.role,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User role updated successfully.",
    data: user,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const isActive =
    typeof req.body.isActive === "boolean"
      ? req.body.isActive
      : req.body.status === "ACTIVE";

  const user = await userService.updateStatus(
    req.params.id as string,
    isActive,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User status updated successfully.",
    data: user,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.softDeleteUser(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User deleted successfully.",
    data: null,
  });
});

export const userController = {
  getAllUsers,
  getUserById,
  getMyProfile,
  updateMyProfile,
  updateRole,
  updateStatus,
  deleteUser,
};