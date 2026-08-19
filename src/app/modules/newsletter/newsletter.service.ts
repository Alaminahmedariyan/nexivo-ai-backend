import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import type { SubscribeInput } from "./newsletter.interface";

// Idempotent-ish: re-subscribing an inactive email reactivates it instead
// of throwing, since from the user's point of view "subscribe" should
// always just mean "I'm now subscribed."
const subscribe = async (payload: SubscribeInput) => {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: payload.email } });

  if (existing) {
    if (existing.isActive) {
      throw new AppError(StatusCodes.CONFLICT, "This email is already subscribed.");
    }
    return prisma.newsletterSubscriber.update({
      where: { email: payload.email },
      data: { isActive: true },
    });
  }

  return prisma.newsletterSubscriber.create({ data: payload });
};

const unsubscribe = async (email: string) => {
  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (!existing) {
    return null;
  }

  return prisma.newsletterSubscriber.update({ where: { email }, data: { isActive: false } });
};

const getAllSubscribers = async (isActive?: boolean) => {
  return prisma.newsletterSubscriber.findMany({
    where: isActive === undefined ? undefined : { isActive },
    orderBy: { createdAt: "desc" },
  });
};

export const newsletterService = { subscribe, unsubscribe, getAllSubscribers };