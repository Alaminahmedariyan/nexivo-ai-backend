import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { fromNodeHeaders } from "better-auth/node";
import { catchAsync } from "../../utils/catchAsync";

import type { AuthenticatedUser } from "../../middlewares/requireAuth";
import { authService } from "./auth.service";
import { applyAuthCookies } from "../../utils/authCookies";

const register = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await authService.register(req.body, fromNodeHeaders(req.headers));
  applyAuthCookies(headers, res);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Registered successfully. Please check your email to verify your account.",
    data,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await authService.login(req.body, fromNodeHeaders(req.headers));
  applyAuthCookies(headers, res);

  res.status(StatusCodes.OK).json({ success: true, message: "Logged in successfully.", data });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await authService.logout(fromNodeHeaders(req.headers));
  applyAuthCookies(headers, res);

  res.status(StatusCodes.OK).json({ success: true, message: "Logged out successfully.", data });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { data } = await authService.forgotPassword(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "If an account exists for this email, a reset link has been sent.",
    data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { data } = await authService.resetPassword(req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Password reset successfully. You can now log in with your new password.",
    data,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { data, headers } = await authService.changePassword(
    req.body,
    fromNodeHeaders(req.headers),
  );
  applyAuthCookies(headers, res);

  res.status(StatusCodes.OK).json({ success: true, message: "Password changed successfully.", data });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Current user retrieved successfully.",
    data: req.user as AuthenticatedUser,
  });
});

export const authController = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
};