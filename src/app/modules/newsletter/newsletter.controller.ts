import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { newsletterService } from "./newsletter.service";

const subscribe = catchAsync(async (req: Request, res: Response) => {
  const subscriber = await newsletterService.subscribe(req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Subscribed to the newsletter successfully.",
    data: subscriber,
  });
});

const unsubscribe = catchAsync(async (req: Request, res: Response) => {
  await newsletterService.unsubscribe(req.body.email);
  res.status(StatusCodes.OK).json({ success: true, message: "Unsubscribed successfully.", data: null });
});

const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const isActive = req.query.isActive === undefined ? undefined : req.query.isActive === "true";
  const subscribers = await newsletterService.getAllSubscribers(isActive);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Subscribers retrieved successfully.",
    data: subscribers,
  });
});

export const newsletterController = { subscribe, unsubscribe, getAllSubscribers };