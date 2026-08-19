import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { clientService } from "./client.service";

const createClient = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.createManual(req.body);

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Client created successfully.",
    data: client,
  });
});

const getAllClients = catchAsync(async (req: Request, res: Response) => {
  const result = await clientService.getAllClients(
    req.query as Record<string, unknown>
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Clients retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getClientById = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.getClientById(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Client retrieved successfully.",
    data: client,
  });
});

const linkUser = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.linkUser(
    req.params.id as string,
    req.body.userId
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "User linked to client successfully.",
    data: client,
  });
});

const updateClient = catchAsync(async (req: Request, res: Response) => {
  const client = await clientService.updateClient(
    req.params.id as string,
    req.body
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Client updated successfully.",
    data: client,
  });
});

const deleteClient = catchAsync(async (req: Request, res: Response) => {
  await clientService.deleteClient(req.params.id as string);

  res.status(StatusCodes.OK).json({
    success: true,
    message: "Client deleted successfully.",
    data: null,
  });
});

export const clientController = {
  createClient,
  getAllClients,
  getClientById,
  linkUser,
  updateClient,
  deleteClient,
};