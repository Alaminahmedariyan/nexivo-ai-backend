import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { QueryBuilder } from "../../query-builder";
import { notificationService } from "../notification/notification.service";

import {
  INVOICE_DEFAULT_SORT,
  INVOICE_FILTERABLE_FIELDS,
  INVOICE_SEARCHABLE_FIELDS,
  INVOICE_SELECT,
  INVOICE_SORTABLE_FIELDS,
} from "./invoice.const";

import type { CreateInvoiceInput, InvoiceItemInput, UpdateInvoiceInput } from "./invoice.interface";

// ============================================================
// HELPERS
// ============================================================

const computeTotals = (items: InvoiceItemInput[], taxRate = 0) => {
  const itemsWithAmount = items.map((item) => ({
    ...item,
    amount: Number((item.quantity * item.unitPrice).toFixed(2)),
  }));

  const subtotal = itemsWithAmount.reduce((sum, item) => sum + item.amount, 0);
  const tax = Number(((subtotal * taxRate) / 100).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  return { itemsWithAmount, subtotal, tax, total };
};

const generateInvoiceNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `INV-${year}-` } },
  });

  let sequence = count + 1;
  let invoiceNumber = `INV-${year}-${String(sequence).padStart(4, "0")}`;

  while (await prisma.invoice.findUnique({ where: { invoiceNumber } })) {
    sequence += 1;
    invoiceNumber = `INV-${year}-${String(sequence).padStart(4, "0")}`;
  }

  return invoiceNumber;
};

// Notifies the client's linked user account, if one exists — a Client
// record created before signup (userId null) simply won't get an
// in-app notification until it's linked.
const notifyClient = async (
  clientId: string,
  title: string,
  message: string,
  entityId: string,
) => {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client?.userId) return;

  await notificationService.createNotification({
    userId: client.userId,
    title,
    message,
    type: "SYSTEM",
    entityType: "CLIENT",
    entityId,
  });
};

// ============================================================
// CREATE
// ============================================================

const createInvoice = async (payload: CreateInvoiceInput) => {
  const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
  if (!client) {
    throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
  }

  if (payload.projectId) {
    const project = await prisma.project.findUnique({ where: { id: payload.projectId } });
    if (!project) {
      throw new AppError(StatusCodes.NOT_FOUND, "Project not found.");
    }
  }

  if (payload.milestoneId) {
    const milestone = await prisma.milestone.findUnique({ where: { id: payload.milestoneId } });
    if (!milestone) {
      throw new AppError(StatusCodes.NOT_FOUND, "Milestone not found.");
    }
  }

  const { itemsWithAmount, subtotal, tax, total } = computeTotals(
    payload.items,
    payload.taxRate ?? 0,
  );

  const invoiceNumber = await generateInvoiceNumber();

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: payload.clientId,
      projectId: payload.projectId,
      milestoneId: payload.milestoneId,
      items: itemsWithAmount as unknown as Prisma.InputJsonValue,
      subtotal,
      tax,
      total,
      currency: payload.currency ?? "USD",
      dueDate: payload.dueDate,
      notes: payload.notes,
    } satisfies Prisma.InvoiceUncheckedCreateInput,
    select: INVOICE_SELECT,
  });
};

// ============================================================
// UPDATE (draft only)
// ============================================================

const updateInvoice = async (id: string, payload: UpdateInvoiceInput) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }
  if (existing.status !== "DRAFT") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only a draft invoice can be edited. Cancel it and create a new one instead.",
    );
  }

  let recomputed: Partial<{
    items: Prisma.InputJsonValue;
    subtotal: number;
    tax: number;
    total: number;
  }> = {};

  if (payload.items) {
    const { itemsWithAmount, subtotal, tax, total } = computeTotals(
      payload.items,
      payload.taxRate ?? 0,
    );
    recomputed = { items: itemsWithAmount as unknown as Prisma.InputJsonValue, subtotal, tax, total };
  }

  return prisma.invoice.update({
    where: { id },
    data: {
      ...recomputed,
      currency: payload.currency,
      dueDate: payload.dueDate,
      notes: payload.notes,
    },
    select: INVOICE_SELECT,
  });
};

// ============================================================
// STATUS TRANSITIONS
// ============================================================

const sendInvoice = async (id: string) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }
  if (existing.status !== "DRAFT") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Only a draft invoice can be sent.");
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { status: "SENT", issuedAt: new Date() },
    select: INVOICE_SELECT,
  });

  await notifyClient(
    invoice.clientId,
    "New invoice",
    `Invoice ${invoice.invoiceNumber} for ${invoice.total} ${invoice.currency} has been issued.`,
    invoice.id,
  );

  return invoice;
};

const cancelInvoice = async (id: string) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }
  if (existing.status === "PAID") {
    throw new AppError(StatusCodes.BAD_REQUEST, "A fully paid invoice cannot be cancelled.");
  }

  return prisma.invoice.update({
    where: { id },
    data: { status: "CANCELLED" },
    select: INVOICE_SELECT,
  });
};

const deleteInvoice = async (id: string) => {
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }
  if (existing.status !== "DRAFT") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Only a draft invoice can be deleted. Cancel it instead if it's already been sent.",
    );
  }

  await prisma.invoice.delete({ where: { id } });
};

// ============================================================
// READ
// ============================================================

const getInvoiceById = async (id: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      project: { select: { id: true, title: true } },
      milestone: { select: { id: true, title: true } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }

  return invoice;
};

const getAllInvoices = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder(prisma.invoice, {
    searchableFields: [...INVOICE_SEARCHABLE_FIELDS],
    filterableFields: INVOICE_FILTERABLE_FIELDS,
    sortableFields: [...INVOICE_SORTABLE_FIELDS],
    selectableFields: Object.keys(INVOICE_SELECT),
    defaultSortField: INVOICE_DEFAULT_SORT,
  });

  return builder.execute(query);
};

const getMyInvoices = async (userId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "No client profile is linked to this account yet.",
    );
  }

  return prisma.invoice.findMany({
    where: { clientId: client.id },
    include: {
      payments: { orderBy: { createdAt: "desc" } },
      project: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const invoiceService = {
  createInvoice,
  updateInvoice,
  sendInvoice,
  cancelInvoice,
  deleteInvoice,
  getInvoiceById,
  getAllInvoices,
  getMyInvoices,
};