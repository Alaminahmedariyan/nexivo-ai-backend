import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { QueryBuilder } from "../../query-builder";
import { TESTIMONIAL_QUERY_CONFIG } from "./testimonial.const";
import type { CreateTestimonialInput, UpdateTestimonialInput } from "./testimonial.interface";

const createTestimonial = async (payload: CreateTestimonialInput) => {
  if (payload.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: payload.clientId },
    });

    if (!client) {
      throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
    }
  }

  return prisma.testimonial.create({
    data: payload satisfies Prisma.TestimonialUncheckedCreateInput,
  });
};

const getAllTestimonials = async (query: Record<string, unknown>) => {
  const builder = new QueryBuilder(prisma.testimonial, TESTIMONIAL_QUERY_CONFIG);
  return builder.execute(query);
};

const getTestimonialById = async (id: string) => {
  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!testimonial) {
    throw new AppError(StatusCodes.NOT_FOUND, "Testimonial not found.");
  }

  return testimonial;
};

const updateTestimonial = async (
  id: string,
  payload: UpdateTestimonialInput
) => {
  const existing = await prisma.testimonial.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Testimonial not found.");
  }

  if (payload.clientId) {
    const client = await prisma.client.findUnique({
      where: { id: payload.clientId },
    });

    if (!client) {
      throw new AppError(StatusCodes.NOT_FOUND, "Client not found.");
    }
  }

  return prisma.testimonial.update({
    where: { id },
    data: payload,
  });
};

const deleteTestimonial = async (id: string) => {
  const existing = await prisma.testimonial.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Testimonial not found.");
  }
  await prisma.testimonial.delete({ where: { id } });
};

export const testimonialService = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};