import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";

import { QueryBuilder } from "../../query-builder";
import {
  CLIENT_DEFAULT_SORT,
  CLIENT_FILTERABLE_FIELDS,
  CLIENT_SEARCHABLE_FIELDS,
  CLIENT_SELECT,
  CLIENT_SORTABLE_FIELDS,
} from "./client.const";

// Called from lead.service.ts when a Lead's status changes to WON.
// Idempotent: leadId is @unique on Client, so a lead can only convert once.
const createFromLead = async (leadId: string) => {
  const existing = await prisma.client.findUnique({ where: { leadId } });
  if (existing) return existing;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw new AppError(StatusCodes.NOT_FOUND, "Lead not found.");
  }

  const client = await prisma.client.create({
    data: {
      leadId,
      companyName: lead.company ?? undefined,
    },
  });

  return client;
};

// Admin manually creates a client (walk-in, no prior Lead).
const createManual = async (payload: {
  companyName?: string;
  leadId?: string;
  userId?: string;
}) => {
  const client = await prisma.client.create({
    data: payload satisfies Prisma.ClientUncheckedCreateInput,
  });
  return client;
};

const getAllClients = async (query: Record<string, unknown>) => {
  const clientQueryBuilder = new QueryBuilder(prisma.client, {
    searchableFields: [...CLIENT_SEARCHABLE_FIELDS],
    filterableFields: CLIENT_FILTERABLE_FIELDS,
    sortableFields: [...CLIENT_SORTABLE_FIELDS],
    selectableFields: Object.keys(CLIENT_SELECT),
    defaultInclude: {
      user: true,
      lead: true,
      projects: true,
    },
    defaultSortField: CLIENT_DEFAULT_SORT,
    softDelete: true,
    maxLimit: 50,
  });

  return clientQueryBuilder.execute(query);
};

const getClientById = async (id: string) => {
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      lead: true,
      projects: true,
      proposals: true,
    },
  });

  if (!client) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }

  return client;
};

// For the "Client existed before User signup" flow — once the client
// creates/gets a User account, link it here.
const linkUser = async (clientId: string, userId: string) => {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }
  if (client.userId) {
    throw new AppError(
      StatusCodes.CONFLICT,
      "This client is already linked to a user account.",
    );
  }

  return prisma.client.update({
    where: { id: clientId },
    data: { userId },
  });
};

const updateClient = async (id: string, payload: Record<string, unknown>) => {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }
  return prisma.client.update({ where: { id }, data: payload });
};

const deleteClient = async (id: string) => {
  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }
  return prisma.client.delete({ where: { id } });
};

export const clientService = {
  createFromLead,
  createManual,
  getAllClients,
  getClientById,
  linkUser,
  updateClient,
  deleteClient,
};