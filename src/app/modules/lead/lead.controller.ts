import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";
import { leadService } from "./lead.service";
import type { AuthenticatedUser } from "../../middlewares/requireAuth";

// ======================================================
// CREATE LEAD
// PUBLIC
// ======================================================

const createLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.createLead(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Thank you! We'll get back to you shortly.",
    data: lead,
  });
});

// ======================================================
// GET ALL LEADS
// PROTECTED
// ======================================================

const getAllLeads = catchAsync(async (req: Request, res: Response) => {
  const result = await leadService.getAllLeads(req.query);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Leads retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

// ======================================================
// GET LEAD BY ID
// PROTECTED
// ======================================================

const getLeadById = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(
    req.params.id as string,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Lead retrieved successfully.",
    data: lead,
  });
});

// ======================================================
// UPDATE LEAD STATUS
// PROTECTED
// ======================================================

const updateLeadStatus = catchAsync(async (req: Request, res: Response) => {
  const currentUser = req.user as AuthenticatedUser;

  const lead = await leadService.updateLeadStatus(
    req.params.id as string,
    req.body,
    currentUser.id,
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Lead status updated successfully.",
    data: lead,
  });
});

const updateLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.updateLead(req.params.id as string, req.body);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Lead updated successfully.",
    data: lead,
  });
});

const convertLeadToClient = catchAsync(async (req: Request, res: Response) => {
  const client = await leadService.convertLeadToClient(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Lead converted to client successfully.",
    data: client,
  });
});

const deleteLead = catchAsync(async (req: Request, res: Response) => {
  await leadService.deleteLead(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Lead deleted successfully.",
    data: null,
  });
});

export const leadController = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  convertLeadToClient,
  deleteLead,
};