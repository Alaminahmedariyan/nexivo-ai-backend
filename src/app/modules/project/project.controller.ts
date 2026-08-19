import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { catchAsync } from "../../utils/catchAsync";
import { projectService } from "./project.service";
import AppError from "../../errors/appError";


/* =========================================================
   CREATE
========================================================= */

const createProject = catchAsync(
  async (req: Request, res: Response) => {
    const project = await projectService.createProject(
      req.body,
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  },
);


/* =========================================================
   GET ALL PROJECTS
========================================================= */

const getAllProjects = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authenticated.",
      );
    }

    const projects = await projectService.getAllProjects(
      req.query,
      user,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Projects retrieved successfully.",
      ...projects,
    });
  },
);


/* =========================================================
   GET PROJECT BY ID
========================================================= */

const getProjectById = catchAsync(
  async (req: Request, res: Response) => {
    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    const user = req.user;

    // TypeScript + runtime safety
    if (!user) {
      throw new AppError(
        StatusCodes.UNAUTHORIZED,
        "You are not authenticated.",
      );
    }

    // =========================================================
    // GET PROJECT
    // =========================================================

    const project = await projectService.getProjectById(
      req.params.id as string,
      {
        id: user.id,
        role: user.role,
      },
    );

    // =========================================================
    // RESPONSE
    // =========================================================

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Project retrieved successfully.",
      data: project,
    });
  },
);


/* =========================================================
   UPDATE
========================================================= */

const updateProject = catchAsync(
  async (req: Request, res: Response) => {
    const project =
      await projectService.updateProject(
        req.params.id as string,
        req.body,
      );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  },
);


/* =========================================================
   ADD MEMBER
========================================================= */

const addMember = catchAsync(
  async (req: Request, res: Response) => {
    const member =
      await projectService.addMember(
        req.params.id as string,
        req.body,
      );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Member added to project successfully.",
      data: member,
    });
  },
);


/* =========================================================
   REMOVE MEMBER
========================================================= */

const removeMember = catchAsync(
  async (req: Request, res: Response) => {
    await projectService.removeMember(
      req.params.id as string,
      req.params.userId as string,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Member removed from project successfully.",
      data: null,
    });
  },
);


/* =========================================================
   DELETE
========================================================= */

const deleteProject = catchAsync(
  async (req: Request, res: Response) => {
    await projectService.deleteProject(
      req.params.id as string,
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Project deleted successfully.",
      data: null,
    });
  },
);


export const projectController = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
};