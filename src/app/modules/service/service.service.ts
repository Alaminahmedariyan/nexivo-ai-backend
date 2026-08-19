import { StatusCodes } from "http-status-codes";
import slugify from "slugify";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { QueryBuilder } from "../../query-builder";
import { SERVICE_QUERY_CONFIG, SERVICE_DETAIL_INCLUDE } from "./service.const";
import type {
  CreateServiceInput,
  UpdateServiceInput,
  CreateServicePackageInput,
  UpdateServicePackageInput,
} from "./service.interface";

const generateUniqueSlug = async (title: string): Promise<string> => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (await prisma.service.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

const createService = async (payload: CreateServiceInput) => {
  const slug = await generateUniqueSlug(payload.title);

  return prisma.service.create({
    data: { ...payload, slug } satisfies Prisma.ServiceUncheckedCreateInput,
  });
};

const getAllServices = async (rawQuery: Record<string, unknown>) => {
  const builder = new QueryBuilder(prisma.service, SERVICE_QUERY_CONFIG);
  return builder.execute(rawQuery);
};

// Public — used by the marketing site. Only ever returns active services.
const getServiceBySlug = async (slug: string) => {
  const service = await prisma.service.findUnique({
    where: { slug },
    include: SERVICE_DETAIL_INCLUDE,
  });

  if (!service || !service.isActive) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
  }

  return service;
};

// Admin — returns regardless of isActive.
const getServiceById = async (id: string) => {
  const service = await prisma.service.findUnique({
    where: { id },
    include: { packages: { orderBy: { order: "asc" } }, portfolios: true },
  });

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
  }

  return service;
};

const updateService = async (id: string, payload: UpdateServiceInput) => {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
  }

  return prisma.service.update({ where: { id }, data: payload });
};

// Hard delete is safe here: ServicePackage cascades, Lead.serviceId and
// Portfolio.serviceId are both onDelete: SetNull.
const deleteService = async (id: string) => {
  const existing = await prisma.service.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
  }

  await prisma.service.delete({ where: { id } });
};

// ------------------------------------------------------------
// ServicePackage — nested resource under a Service
// ------------------------------------------------------------
const addPackage = async (serviceId: string, payload: CreateServicePackageInput) => {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, "Service not found.");
  }

  return prisma.servicePackage.create({
    data: {
      serviceId,
      name: payload.name,
      price: payload.price,
      features: payload.features as Prisma.InputJsonValue,
      order: payload.order,
    } satisfies Prisma.ServicePackageUncheckedCreateInput,
  });
};

const updatePackage = async (id: string, payload: UpdateServicePackageInput) => {
  const existing = await prisma.servicePackage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Package not found.");
  }

  return prisma.servicePackage.update({
    where: { id },
    data: {
      ...payload,
      features: payload.features as Prisma.InputJsonValue | undefined,
    },
  });
};

const deletePackage = async (id: string) => {
  const existing = await prisma.servicePackage.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Package not found.");
  }

  await prisma.servicePackage.delete({ where: { id } });
};

export const serviceService = {
  createService,
  getAllServices,
  getServiceBySlug,
  getServiceById,
  updateService,
  deleteService,
  addPackage,
  updatePackage,
  deletePackage,
};