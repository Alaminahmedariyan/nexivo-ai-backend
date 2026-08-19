import { StatusCodes } from "http-status-codes";
import slugify from "slugify";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import { Prisma } from "../../../../generated/prisma/client";
import { QueryBuilder } from "../../query-builder";
import { PORTFOLIO_QUERY_CONFIG, PORTFOLIO_DETAIL_INCLUDE } from "./portfolio.const";
import type { AddPortfolioImageInput, CreatePortfolioInput, UpdatePortfolioInput } from "./portfolio.interface";

const generateUniqueSlug = async (title: string): Promise<string> => {
  const base = slugify(title, { lower: true, strict: true });
  let slug = base;
  let counter = 1;

  while (await prisma.portfolio.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
};

const createPortfolio = async (payload: CreatePortfolioInput) => {
  const slug = await generateUniqueSlug(payload.title);

  return prisma.portfolio.create({
    data: {
      title: payload.title,
      slug,
      description: payload.description,
      thumbnail: payload.thumbnail,
      liveUrl: payload.liveUrl,
      serviceId: payload.serviceId,
      isFeatured: payload.isFeatured,
      order: payload.order,
      images: payload.images?.length ? { create: payload.images } : undefined,
      technologies: payload.technologyIds?.length
        ? { create: payload.technologyIds.map((technologyId) => ({ technologyId })) }
        : undefined,
    } satisfies Prisma.PortfolioUncheckedCreateInput,
    include: PORTFOLIO_DETAIL_INCLUDE,
  });
};

const getAllPortfolios = async (rawQuery: Record<string, unknown>) => {
  const builder = new QueryBuilder(prisma.portfolio, PORTFOLIO_QUERY_CONFIG);
  return builder.execute(rawQuery);
};

const getPortfolioBySlug = async (slug: string) => {
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: PORTFOLIO_DETAIL_INCLUDE,
  });

  if (!portfolio) {
    throw new AppError(StatusCodes.NOT_FOUND, "Portfolio not found.");
  }

  return portfolio;
};

const updatePortfolio = async (id: string, payload: UpdatePortfolioInput) => {
  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Portfolio not found.");
  }

  return prisma.portfolio.update({ where: { id }, data: payload });
};

const deletePortfolio = async (id: string) => {
  const existing = await prisma.portfolio.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Portfolio not found.");
  }

  // Images and technology links both cascade on delete.
  await prisma.portfolio.delete({ where: { id } });
};

// ------------------------------------------------------------
// Images
// ------------------------------------------------------------
const addImage = async (portfolioId: string, payload: AddPortfolioImageInput) => {
  const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
  if (!portfolio) {
    throw new AppError(StatusCodes.NOT_FOUND, "Portfolio not found.");
  }

  return prisma.portfolioImage.create({
    data: { portfolioId, ...payload } satisfies Prisma.PortfolioImageUncheckedCreateInput,
  });
};

const removeImage = async (imageId: string) => {
  const existing = await prisma.portfolioImage.findUnique({ where: { id: imageId } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Image not found.");
  }

  await prisma.portfolioImage.delete({ where: { id: imageId } });
};

// ------------------------------------------------------------
// Technology links
// ------------------------------------------------------------
const addTechnology = async (portfolioId: string, technologyId: string) => {
  const [portfolio, technology] = await Promise.all([
    prisma.portfolio.findUnique({ where: { id: portfolioId } }),
    prisma.technology.findUnique({ where: { id: technologyId } }),
  ]);

  if (!portfolio) throw new AppError(StatusCodes.NOT_FOUND, "Portfolio not found.");
  if (!technology) throw new AppError(StatusCodes.NOT_FOUND, "Technology not found.");

  const existingLink = await prisma.portfolioTechnology.findUnique({
    where: { portfolioId_technologyId: { portfolioId, technologyId } },
  });
  if (existingLink) {
    throw new AppError(StatusCodes.CONFLICT, "This technology is already linked to the portfolio.");
  }

  return prisma.portfolioTechnology.create({ data: { portfolioId, technologyId } });
};

const removeTechnology = async (portfolioId: string, technologyId: string) => {
  const existingLink = await prisma.portfolioTechnology.findUnique({
    where: { portfolioId_technologyId: { portfolioId, technologyId } },
  });
  if (!existingLink) {
    throw new AppError(StatusCodes.NOT_FOUND, "This technology is not linked to the portfolio.");
  }

  await prisma.portfolioTechnology.delete({
    where: { portfolioId_technologyId: { portfolioId, technologyId } },
  });
};

export const portfolioService = {
  createPortfolio,
  getAllPortfolios,
  getPortfolioBySlug,
  updatePortfolio,
  deletePortfolio,
  addImage,
  removeImage,
  addTechnology,
  removeTechnology,
};