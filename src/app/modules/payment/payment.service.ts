import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";

import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { QueryBuilder } from "../../query-builder";
import config from "../../config";
import { notificationService } from "../notification/notification.service";

import {
  PAYMENT_DEFAULT_SORT,
  PAYMENT_FILTERABLE_FIELDS,
  PAYMENT_SEARCHABLE_FIELDS,
  PAYMENT_SELECT,
  PAYMENT_SORTABLE_FIELDS,
} from "./payment.const";

import type { RecordManualPaymentInput } from "./payment.interface";

// ============================================================
// 1. STRIPE CLIENT (Lazy Initializer)
// ============================================================

let stripeClient: Stripe | null = null;

const getStripeClient = (): Stripe => {
  if (!config.stripe.secretKey) {
    throw new AppError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "Stripe is not configured on this server. Set STRIPE_SECRET_KEY to enable card payments.",
    );
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.stripe.secretKey);
  }
  return stripeClient;
};

// ============================================================
// 2. INTERNAL HELPERS
// ============================================================

const syncInvoiceStatus = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: "SUCCEEDED" } } },
  });
  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);

  let status: "SENT" | "PARTIALLY_PAID" | "PAID" = "SENT";
  if (totalPaid >= Number(invoice.total)) status = "PAID";
  else if (totalPaid > 0) status = "PARTIALLY_PAID";

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });
};

const notifyPaymentReceived = async (invoiceId: string, amount: number, currency: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { invoiceNumber: true, clientId: true },
  });
  if (!invoice) return;

  const client = await prisma.client.findUnique({ where: { id: invoice.clientId } });
  if (!client?.userId) return;

  await notificationService.createNotification({
    userId: client.userId,
    title: "Payment received",
    message: `Payment of ${amount} ${currency} received for invoice ${invoice.invoiceNumber}.`,
    type: "SYSTEM",
    entityType: "CLIENT",
    entityId: invoiceId,
  });
};

// ============================================================
// 3. CREATE STRIPE PAYMENT INTENTS
// ============================================================

const createStripePaymentIntent = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: "SUCCEEDED" } } },
  });

  if (!invoice) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }
  if (invoice.status === "PAID") {
    throw new AppError(StatusCodes.BAD_REQUEST, "This invoice is already fully paid.");
  }
  if (invoice.status === "CANCELLED") {
    throw new AppError(StatusCodes.BAD_REQUEST, "This invoice has been cancelled.");
  }

  const alreadyPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remaining = Number(invoice.total) - alreadyPaid;

  if (remaining <= 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, "There is no remaining balance on this invoice.");
  }

  const stripe = getStripeClient();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(remaining * 100),
    currency: invoice.currency.toLowerCase(),
    metadata: { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber },
  });

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: remaining,
      currency: invoice.currency,
      method: "STRIPE",
      status: "PENDING",
      stripePaymentIntentId: paymentIntent.id,
    } satisfies Prisma.PaymentUncheckedCreateInput,
    select: PAYMENT_SELECT,
  });

  return { clientSecret: paymentIntent.client_secret, payment };
};

const createMyStripePaymentIntent = async (userId: string, invoiceId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      "No client profile is linked to this account yet.",
    );
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, clientId: client.id },
  });
  if (!invoice) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }

  return createStripePaymentIntent(invoiceId);
};

// ============================================================
// 4. MANUAL PAYMENT
// ============================================================

const recordManualPayment = async (invoiceId: string, payload: RecordManualPaymentInput) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: { where: { status: "SUCCEEDED" } } },
  });

  if (!invoice) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }

  const alreadyPaid = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const remaining = Number(invoice.total) - alreadyPaid;

  if (payload.amount > remaining) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Payment amount exceeds the remaining balance of ${remaining} ${invoice.currency}.`,
    );
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount: payload.amount,
      currency: invoice.currency,
      method: payload.method ?? "BANK_TRANSFER",
      status: "SUCCEEDED",
      paidAt: new Date(),
      notes: payload.notes,
    } satisfies Prisma.PaymentUncheckedCreateInput,
    select: PAYMENT_SELECT,
  });

  await syncInvoiceStatus(invoiceId);
  await notifyPaymentReceived(invoiceId, payload.amount, invoice.currency);

  return payment;
};

// ============================================================
// 5. REFUND PAYMENT
// ============================================================

const refundPayment = async (paymentId: string, amount?: number) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, "Payment not found.");
  }
  if (payment.status !== "SUCCEEDED") {
    throw new AppError(StatusCodes.BAD_REQUEST, "Only a succeeded payment can be refunded.");
  }

  // Manual payments (bank transfer/cash) — Stripe never touched this
  // money, so there's nothing to call the API for. Just flip the status;
  // reconciling the actual refund transfer is on the admin outside this system.
  if (payment.method !== "STRIPE" || !payment.stripeChargeId) {
    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "REFUNDED" },
      select: PAYMENT_SELECT,
    });
    await syncInvoiceStatus(payment.invoiceId);
    return updated;
  }

  const stripe = getStripeClient();

  const refund = await stripe.refunds.create({
    charge: payment.stripeChargeId,
    amount: amount ? Math.round(amount * 100) : undefined,
  });

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "REFUNDED", stripeRefundId: refund.id },
    select: PAYMENT_SELECT,
  });

  await syncInvoiceStatus(payment.invoiceId);

  return updated;
};

// ============================================================
// 6. STRIPE WEBHOOK (With Idempotency)
// ============================================================

const handleStripeWebhook = async (rawBody: Buffer, signature: string) => {
  if (!config.stripe.webhookSecret) {
    throw new AppError(
      StatusCodes.SERVICE_UNAVAILABLE,
      "STRIPE_WEBHOOK_SECRET is not configured on this server.",
    );
  }

  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
  } catch {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid Stripe webhook signature.");
  }

  // Idempotency guard — Stripe may redeliver the same event (network
  // retries on their end). Without this check a redelivered
  // "payment_intent.succeeded" would re-run the same update, which is
  // harmless here, but a redelivered event racing with a manual refund
  // could re-mark a refunded payment as SUCCEEDED. Always dedupe on the
  // event id before acting on it.
  const alreadyProcessed = await prisma.stripeWebhookEvent.findUnique({
    where: { stripeEventId: event.id },
  });
  if (alreadyProcessed) {
    return { received: true, duplicate: true };
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: intent.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCEEDED",
            paidAt: new Date(),
            stripeChargeId:
              typeof intent.latest_charge === "string" ? intent.latest_charge : undefined,
          },
        });
        await syncInvoiceStatus(payment.invoiceId);
        await notifyPaymentReceived(payment.invoiceId, Number(payment.amount), payment.currency);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: intent.id },
      });

      if (payment) {
        await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
      }
      break;
    }

    default:
      break;
  }

  await prisma.stripeWebhookEvent.create({
    data: { stripeEventId: event.id, type: event.type },
  });

  return { received: true };
};

// ============================================================
// 7. READ / QUERY SERVICES
// ============================================================

const getAllPayments = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder(prisma.payment, {
    searchableFields: PAYMENT_SEARCHABLE_FIELDS,
    filterableFields: PAYMENT_FILTERABLE_FIELDS,
    sortableFields: [...PAYMENT_SORTABLE_FIELDS],
    selectableFields: Object.keys(PAYMENT_SELECT),
    defaultSortField: PAYMENT_DEFAULT_SORT,
  });

  return builder.execute(query);
};

const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { invoice: { select: { id: true, invoiceNumber: true, clientId: true } } },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, "Payment not found.");
  }

  return payment;
};

const getPaymentsByInvoice = async (invoiceId: string) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) {
    throw new AppError(StatusCodes.NOT_FOUND, "Invoice not found.");
  }

  return prisma.payment.findMany({
    where: { invoiceId },
    select: PAYMENT_SELECT,
    orderBy: { createdAt: "desc" },
  });
};

// ============================================================
// EXPORT SERVICE
// ============================================================

export const paymentService = {
  createStripePaymentIntent,
  createMyStripePaymentIntent,
  recordManualPayment,
  refundPayment,
  handleStripeWebhook,
  getAllPayments,
  getPaymentById,
  getPaymentsByInvoice,
};