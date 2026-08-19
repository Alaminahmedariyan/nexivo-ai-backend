import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

import { QueryBuilder } from "../../query-builder";

import {
  PROJECT_DEFAULT_SORT,
  PROJECT_FILTERABLE_FIELDS,
  PROJECT_SEARCHABLE_FIELDS,
  PROJECT_SELECT,
  PROJECT_SORTABLE_FIELDS,
} from "./project.const";

import type {
  AddProjectMemberInput,
  CreateProjectInput,
  UpdateProjectInput,
} from "./project.interface";
import { getClientIdFromUserId, verifyProjectClientAccess } from "./project.helper";

/* =========================================================
   CREATE PROJECT
========================================================= */

const createProject = async (payload: CreateProjectInput) => {
  const client = await prisma.client.findFirst({
    where: { id: payload.clientId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }

  const project = await prisma.project.create({
    data: payload satisfies Prisma.ProjectUncheckedCreateInput,
    select: PROJECT_SELECT,
  });

  return project;
};

/* =========================================================
   GET ALL PROJECTS — QueryBuilder
========================================================= */

const getAllProjects = async (
  query: Record<string, unknown>,
  user: {
    id: string;
    role: string;
  },
) => {
  /*
   * =========================================================
   * CLIENT
   * =========================================================
   *
   * Client can only see projects that belong to himself.
   *
   * We inject clientId from authenticated user instead of
   * trusting clientId coming from req.query.
   */

  if (user.role === "CLIENT") {
    const client = await prisma.client.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!client) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        "Client profile not found.",
      );
    }

    /*
     * IMPORTANT:
     * Do not allow the client to override clientId
     * through query parameters.
     */
    const safeQuery = {
      ...query,
      clientId: client.id,
    };

    const projectQueryBuilder = new QueryBuilder<
      Prisma.ProjectGetPayload<{
        select: typeof PROJECT_SELECT;
      }>,
      Prisma.ProjectWhereInput
    >(
      prisma.project,
      {
        searchableFields: PROJECT_SEARCHABLE_FIELDS,
        filterableFields: PROJECT_FILTERABLE_FIELDS,
        sortableFields: PROJECT_SORTABLE_FIELDS,
        selectableFields: Object.keys(PROJECT_SELECT),
        softDelete: true,
        defaultSortField: PROJECT_DEFAULT_SORT,
      },
    );

    return projectQueryBuilder.execute(safeQuery);
  }

  /*
   * =========================================================
   * ADMIN / SUPER_ADMIN / TEAM_MEMBER
   * =========================================================
   *
   * These users can see all projects according to
   * QueryBuilder filters.
   */

  const projectQueryBuilder = new QueryBuilder<
    Prisma.ProjectGetPayload<{
      select: typeof PROJECT_SELECT;
    }>,
    Prisma.ProjectWhereInput
  >(
    prisma.project,
    {
      searchableFields: PROJECT_SEARCHABLE_FIELDS,
      filterableFields: PROJECT_FILTERABLE_FIELDS,
      sortableFields: PROJECT_SORTABLE_FIELDS,
      selectableFields: Object.keys(PROJECT_SELECT),
      softDelete: true,
      defaultSortField: PROJECT_DEFAULT_SORT,
    },
  );

  return projectQueryBuilder.execute(query);
};

/* =========================================================
   GET PROJECT BY ID
========================================================= */

const getProjectById = async (
  id: string,
  user: {
    id: string;
    role: string;
  },
) => {
  /*
   * CLIENT:
   * Verify that this project actually belongs
   * to the logged-in client.
   */
  if (user.role === "CLIENT") {
    await verifyProjectClientAccess(
      id,
      user.id,
    );
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      deletedAt: null,
    },

    include: {
      client: true,

      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },

      milestones: {
        orderBy: {
          order: "asc",
        },
      },

      timeline: {
        orderBy: {
          statusDate: "desc",
        },
      },

      files: true,
    },
  });

  if (!project) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "Project not found.",
    );
  }

  return project;
};
/* =========================================================
   UPDATE PROJECT
========================================================= */

const updateProject = async (id: string, payload: UpdateProjectInput) => {
  const existingProject = await prisma.project.findFirst({
    where: { id, deletedAt: null },
  });

  if (!existingProject) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const isNewlyCompleted =
    payload.status === "COMPLETED" && existingProject.status !== "COMPLETED";

  const updatedProject = await prisma.project.update({
    where: { id },
    data: {
      ...payload,
      ...(isNewlyCompleted && { completedAt: new Date() }),
    },
    select: PROJECT_SELECT,
  });

  return updatedProject;
};

/* =========================================================
   ADD PROJECT MEMBER
========================================================= */

const addMember = async (projectId: string, payload: AddProjectMemberInput) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: { id: true },
  });

  if (!project) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null },
    select: { id: true, role: true, isActive: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found.");
  }

  if (!user.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user account is inactive.");
  }

  if (
    user.role !== "TEAM_MEMBER" &&
    user.role !== "ADMIN" &&
    user.role !== "SUPER_ADMIN"
  ) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only team members or admins can be added to a project.",
    );
  }

  const existingMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: payload.userId } },
  });

  if (existingMembership) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "This user is already a member of this project.",
    );
  }

  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId: payload.userId,
      projectRole: payload.projectRole,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  return member;
};

/* =========================================================
   REMOVE PROJECT MEMBER
========================================================= */

const removeMember = async (projectId: string, userId: string) => {
  const existingMembership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });

  if (!existingMembership) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "This user is not a member of this project.",
    );
  }

  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
};

const deleteProject = async (id: string) => {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
  }
  return prisma.project.delete({ where: { id } });
};

export const projectService = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  addMember,
  removeMember,
  deleteProject,
};
