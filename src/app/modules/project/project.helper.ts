import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError";
import { prisma } from "../../../lib/prisma";

export const getClientIdFromUserId = async (
  userId: string,
): Promise<string> => {
  const client = await prisma.client.findFirst({
    where: {
      userId,
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

  return client.id;
};


export const verifyProjectClientAccess = async (
  projectId: string,
  userId: string,
) => {
  const clientId = await getClientIdFromUserId(userId);

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      clientId,
      deletedAt: null,
    },
    select: {
      id: true,
      clientId: true,
    },
  });

  if (!project) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You do not have permission to access this project.",
    );
  }

  return project;
};