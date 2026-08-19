import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { activityLogService } from "./activityLog.service";

const getActivityLogs = catchAsync(
  async (req: Request, res: Response) => {
    const result = await activityLogService.getActivityLogs(
      req.query,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Activity logs retrieved successfully.",
      meta: result.meta,
      data: result.data,
    });
  },
);

export const activityLogController = {
  getActivityLogs,
};