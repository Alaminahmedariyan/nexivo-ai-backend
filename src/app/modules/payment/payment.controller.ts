import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createStripePaymentIntent(req.params.invoiceId as string);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Stripe payment intent created.",
    data: result,
  });
});

const createMyPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;
  const result = await paymentService.createMyStripePaymentIntent(
    currentUser.id,
    req.params.invoiceId as string,
  );
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Stripe payment intent created.",
    data: result,
  });
});

const recordManualPayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.recordManualPayment(req.params.invoiceId as string, req.body);
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Payment recorded successfully.",
    data: payment,
  });
});

const refundPayment = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.refundPayment(req.params.id as string, req.body.amount);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payment refunded successfully.",
    data: payment,
  });
});

const getPaymentsByInvoice = catchAsync(async (req: Request, res: Response) => {
  const payments = await paymentService.getPaymentsByInvoice(req.params.invoiceId as string);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payments retrieved successfully.",
    data: payments,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.getAllPayments(req.query);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payments retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentById(req.params.id as string);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Payment retrieved successfully.",
    data: payment,
  });
});

const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string") {
      throw new AppError(StatusCodes.BAD_REQUEST, "Missing Stripe signature header.");
    }

    const result = await paymentService.handleStripeWebhook(req.body as Buffer, signature);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : StatusCodes.BAD_REQUEST;
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    res.status(statusCode).json({ success: false, message });
  }
};

export const paymentController = {
  createPaymentIntent,
  createMyPaymentIntent,
  recordManualPayment,
  refundPayment,
  getPaymentsByInvoice,
  getAllPayments,
  getPaymentById,
  stripeWebhook,
};