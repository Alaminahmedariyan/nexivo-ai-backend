import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import type { MilestoneStatus } from "../../../../generated/prisma/enums";

import { QueryBuilder } from "../../query-builder";

import {
  MILESTONE_SEARCHABLE_FIELDS,
  MILESTONE_FILTERABLE_FIELDS,
  MILESTONE_SORTABLE_FIELDS,
  MILESTONE_DEFAULT_SORT,
} from "./milestone.const";

type CreateMilestoneInput = {
  title: string;
  description?: string;
  dueDate?: Date;
  order?: number;
};

type UpdateMilestoneInput = Partial<{
  title: string;
  description: string;
  dueDate: Date;
  status: MilestoneStatus;
  order: number;
}>;

// ============================================================
// CREATE
// ============================================================

const createMilestone = async (
  projectId: string,
  payload: CreateMilestoneInput,
) => {
  // First verify project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const milestone = await prisma.milestone.create({
    data: {
      projectId,
      ...payload,
    } satisfies Prisma.MilestoneUncheckedCreateInput,
  });

  return milestone;
};

// ============================================================
// QUERY BUILDER
// ============================================================

const getAllMilestones = async (
  projectId: string,
  query: Record<string, unknown>,
) => {
  // Verify parent project exists
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const milestoneQueryBuilder = new QueryBuilder(
    prisma.milestone,
    {
      searchableFields: MILESTONE_SEARCHABLE_FIELDS,

      filterableFields: MILESTONE_FILTERABLE_FIELDS,

      sortableFields: MILESTONE_SORTABLE_FIELDS,

      softDelete: false,

      defaultSortField: MILESTONE_DEFAULT_SORT,
    },
  );

  /*
   * projectId is forced AFTER spreading req.query.
   *
   * So client cannot override the projectId:
   *
   * req.query.projectId = "another-project"
   *
   * will still result in:
   *
   * projectId = actual :projectId
   */
  return milestoneQueryBuilder.execute({
    ...query,
    projectId,
  });
};

// ============================================================
// GET SINGLE
// ============================================================

const getMilestoneById = async (id: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          client: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      },
    },
  });

  if (!milestone) {
    throw new AppError(StatusCodes.NOT_FOUND, "Milestone not found.");
  }

  return milestone;
};

// ============================================================
// UPDATE
// ============================================================

const updateMilestone = async (
  id: string,
  payload: UpdateMilestoneInput,
) => {
  const existing = await prisma.milestone.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Milestone not found.");
  }

  const milestone = await prisma.milestone.update({
    where: { id },
    data: payload,
  });

  return milestone;
};

// ============================================================
// DELETE
// ============================================================

const deleteMilestone = async (id: string) => {
  const existing = await prisma.milestone.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Milestone not found.");
  }

  await prisma.milestone.delete({
    where: { id },
  });
};

// ============================================================
// EXPORT
// ============================================================

export const milestoneService = {
  createMilestone,
  getAllMilestones,
  getMilestoneById,
  updateMilestone,
  deleteMilestone,
};