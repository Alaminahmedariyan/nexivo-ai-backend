import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { invoiceService } from "./invoice.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

const createInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.createInvoice(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Invoice created successfully.", data: invoice });
});

const updateInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.updateInvoice(req.params.id as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Invoice updated successfully.", data: invoice });
});

const sendInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.sendInvoice(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Invoice sent successfully.", data: invoice });
});

const cancelInvoice = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.cancelInvoice(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Invoice cancelled successfully.", data: invoice });
});

const deleteInvoice = catchAsync(async (req: Request, res: Response) => {
  await invoiceService.deleteInvoice(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Invoice deleted successfully.", data: null });
});

const getInvoiceById = catchAsync(async (req: Request, res: Response) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Invoice retrieved successfully.", data: invoice });
});

const getAllInvoices = catchAsync(async (req: Request, res: Response) => {
  const result = await invoiceService.getAllInvoices(req.query);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Invoices retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getMyInvoices = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;
  const invoices = await invoiceService.getMyInvoices(currentUser.id);
  res.status(StatusCodes.OK).json({ success: true, message: "Your invoices retrieved successfully.", data: invoices });
});

export const invoiceController = {
  createInvoice,
  updateInvoice,
  sendInvoice,
  cancelInvoice,
  deleteInvoice,
  getInvoiceById,
  getAllInvoices,
  getMyInvoices,
};