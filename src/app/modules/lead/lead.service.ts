import { StatusCodes } from "http-status-codes";

import AppError from "../../errors/appError";

import { prisma } from "../../../lib/prisma";

import { Prisma } from "../../../../generated/prisma/client";

import type {
  LeadStatus,
  BudgetRange,
  LeadSource,
} from "../../../../generated/prisma";

import { QueryBuilder } from "../../query-builder";

import { clientService } from "../client/client.service";

import { activityLogService } from "../activityLog/activityLog.service";

import { notificationService } from "../notification/notification.service";

import {
  LEAD_PUBLIC_SELECT,
  LEAD_SEARCHABLE_FIELDS,
  LEAD_FILTERABLE_FIELDS,
  LEAD_SORTABLE_FIELDS,
  LEAD_DEFAULT_SORT,
} from "./lead.const";

import type { CreateLeadInput, UpdateLeadStatusInput } from "./lead.interface";

// ======================================================
// CREATE LEAD
// ======================================================

const createLead = async (payload: CreateLeadInput) => {
  // ----------------------------------------------------
  // Validate service if serviceId provided
  // ----------------------------------------------------

  if (payload.serviceId) {
    const service = await prisma.service.findUnique({
      where: {
        id: payload.serviceId,
      },
      select: {
        id: true,
      },
    });

    if (!service) {
      throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
    }
  }

  // ----------------------------------------------------
  // Create Lead
  // ----------------------------------------------------

  const lead = await prisma.lead.create({
    data: {
      ...payload,
      status: "NEW",
    } satisfies Prisma.LeadUncheckedCreateInput,

    select: LEAD_PUBLIC_SELECT,
  });

  return lead;
};

// ======================================================
// GET ALL LEADS
// QueryBuilder
// ======================================================

const getAllLeads = async (queryParams: Record<string, unknown>) => {
  const leadQuery = new QueryBuilder<
    Prisma.LeadGetPayload<{
      select: typeof LEAD_PUBLIC_SELECT;
    }>,
    Prisma.LeadWhereInput
  >(prisma.lead, {
    searchableFields: [...LEAD_SEARCHABLE_FIELDS],

    filterableFields: {
      ...LEAD_FILTERABLE_FIELDS,
    },

    sortableFields: [...LEAD_SORTABLE_FIELDS],

    selectableFields: Object.keys(LEAD_PUBLIC_SELECT),

    defaultSortField: LEAD_DEFAULT_SORT,
  });

  const result = await leadQuery.execute(queryParams);

  return result;
};

// ======================================================
// GET LEAD BY ID
// ======================================================

const getLeadById = async (id: string) => {
  const lead = await prisma.lead.findUnique({
    where: {
      id,
    },

    include: {
      service: true,

      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },

      client: true,

      proposals: true,
    },
  });

  if (!lead) {
    throw new AppError(StatusCodes.NOT_FOUND, "Lead not found.");
  }

  return lead;
};

// ======================================================
// UPDATE LEAD STATUS
// ======================================================

const updateLeadStatus = async (
  id: string,
  payload: UpdateLeadStatusInput,
  actorUserId: string,
) => {
  // ----------------------------------------------------
  // Find existing lead
  // ----------------------------------------------------

  const existingLead = await prisma.lead.findUnique({
    where: {
      id,
    },
  });

  if (!existingLead) {
    throw new AppError(StatusCodes.NOT_FOUND, "Lead not found.");
  }

  // ----------------------------------------------------
  // Validate assigned user
  // ----------------------------------------------------

  if (payload.assignedToId) {
    const assignedUser = await prisma.user.findUnique({
      where: {
        id: payload.assignedToId,
      },

      select: {
        id: true,
        role: true,
      },
    });

    if (!assignedUser) {
      throw new AppError(StatusCodes.NOT_FOUND, "Assigned user not found.");
    }

    if (
      assignedUser.role !== "TEAM_MEMBER" &&
      assignedUser.role !== "ADMIN" &&
      assignedUser.role !== "SUPER_ADMIN"
    ) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        "Lead can only be assigned to a team member or admin.",
      );
    }
  }

  // ----------------------------------------------------
  // Determine status transition
  // ----------------------------------------------------

  const isNewlyWon = payload.status === "WON" && existingLead.status !== "WON";

  // ----------------------------------------------------
  // Update Lead
  // ----------------------------------------------------

  const updatedLead = await prisma.lead.update({
    where: {
      id,
    },

    data: {
      status: payload.status,

      ...(payload.assignedToId !== undefined && {
        assignedToId: payload.assignedToId,
      }),

      ...(isNewlyWon && {
        convertedAt: new Date(),
      }),
    },

    select: LEAD_PUBLIC_SELECT,
  });

  // ----------------------------------------------------
  // Lead -> Client conversion
  // ----------------------------------------------------

  if (isNewlyWon) {
    await clientService.createFromLead(id);
  }

  // ----------------------------------------------------
  // Activity Log
  // ----------------------------------------------------

  await activityLogService.logActivity({
    userId: actorUserId,

    action: "status_changed",

    entityType: "Lead",

    entityId: id,

    metadata: {
      from: existingLead.status,
      to: payload.status,

      ...(payload.assignedToId && {
        assignedToId: payload.assignedToId,
      }),
    },
  });

  // ----------------------------------------------------
  // Notification
  // ----------------------------------------------------

  if (payload.assignedToId) {
    await notificationService.createNotification({
      userId: payload.assignedToId,

      title: "Lead assigned to you",

      message: `Lead "${updatedLead.name}" was assigned to you.`,

      type: "LEAD",

      entityType: "LEAD",

      entityId: updatedLead.id,
    });
  }

  // ----------------------------------------------------
  // Return updated lead
  // ----------------------------------------------------

  return updatedLead;
};

// ======================================================
// EXPORT
// ======================================================

const updateLead = async (id: string, payload: Record<string, unknown>) => {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Lead not found.");
  }
  return prisma.lead.update({ where: { id }, data: payload });
};

const convertLeadToClient = async (id: string) => {
  return clientService.createFromLead(id);
};

const deleteLead = async (id: string) => {
  const existing = await prisma.lead.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Lead not found.");
  }
  return prisma.lead.delete({ where: { id } });
};

export const leadService = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  updateLead,
  convertLeadToClient,
  deleteLead,
};
