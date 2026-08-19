import { StatusCodes } from "http-status-codes";
import { Prisma } from "../../../generated/prisma";

type TPrismaError = {
  statusCode: number;
  message: string;
  errorCode?: string;
};

export const handlePrismaError = (
  error: unknown
): TPrismaError | null => {
  const err = error as any;

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      statusCode: StatusCodes.BAD_REQUEST,
      message: "Invalid request data.",
      errorCode: "PRISMA_VALIDATION_ERROR",
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || err?.code) {
    const code = err.code as string;

    switch (code) {
      case "P2002":
        return {
          statusCode: StatusCodes.CONFLICT,
          message: "Resource already exists.",
          errorCode: code,
        };

      case "P2003":
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Foreign key constraint failed.",
          errorCode: code,
        };

      case "P2025":
        return {
          statusCode: StatusCodes.NOT_FOUND,
          message: "Resource not found.",
          errorCode: code,
        };

      default:
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          message: "Database request failed.",
          errorCode: code,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      statusCode: StatusCodes.SERVICE_UNAVAILABLE,
      message: "Database connection failed.",
      errorCode: err?.errorCode ?? "PRISMA_INIT_ERROR",
    };
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Database query failed.",
      errorCode: "PRISMA_UNKNOWN_ERROR",
    };
  }

  return null;
};