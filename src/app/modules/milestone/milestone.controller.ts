import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { milestoneService } from "./milestone.service";

// ============================================================
// CREATE
// ============================================================

const createMilestone = catchAsync(
  async (req: Request, res: Response) => {
    const milestone = await milestoneService.createMilestone(
      req.params.projectId as string,
      req.body,
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Milestone created successfully.",
      data: milestone,
    });
  },
);

// ============================================================
// GET ALL BY PROJECT
// ============================================================

const getMilestonesByProject = catchAsync(
  async (req: Request, res: Response) => {
    const milestones = await milestoneService.getAllMilestones(
      req.params.projectId as string,
      req.query,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Milestones retrieved successfully.",
      data: milestones,
    });
  },
);

// ============================================================
// GET SINGLE
// ============================================================

const getMilestoneById = catchAsync(
  async (req: Request, res: Response) => {
    const milestone = await milestoneService.getMilestoneById(
      req.params.milestoneId as string,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Milestone retrieved successfully.",
      data: milestone,
    });
  },
);

// ============================================================
// UPDATE
// ============================================================

const updateMilestone = catchAsync(
  async (req: Request, res: Response) => {
    const milestone = await milestoneService.updateMilestone(
      req.params.milestoneId as string,
      req.body,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Milestone updated successfully.",
      data: milestone,
    });
  },
);

// ============================================================
// DELETE
// ============================================================

const deleteMilestone = catchAsync(
  async (req: Request, res: Response) => {
    await milestoneService.deleteMilestone(
      req.params.milestoneId as string,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Milestone deleted successfully.",
      data: null,
    });
  },
);

export const milestoneController = {
  createMilestone,
  getMilestonesByProject,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
};