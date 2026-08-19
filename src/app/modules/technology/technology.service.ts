import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";
import type { CreateTechnologyInput, UpdateTechnologyInput } from "./technology.interface";

const createTechnology = async (payload: CreateTechnologyInput) => {
  const existing = await prisma.technology.findUnique({ where: { name: payload.name } });
  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, "A technology with this name already exists.");
  }

  return prisma.technology.create({ data: payload });
};

const getAllTechnologies = async () => {
  return prisma.technology.findMany({ orderBy: { name: "asc" } });
};

const updateTechnology = async (id: string, payload: UpdateTechnologyInput) => {
  const existing = await prisma.technology.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Technology not found.");
  }

  return prisma.technology.update({ where: { id }, data: payload });
};

const deleteTechnology = async (id: string) => {
  const existing = await prisma.technology.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Technology not found.");
  }

  await prisma.technology.delete({ where: { id } });
};

export const technologyService = { createTechnology, getAllTechnologies, updateTechnology, deleteTechnology };