import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { serviceService } from "./service.service";

const createService = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.createService(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Service created successfully.", data: service });
});

const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await serviceService.getAllServices(req.query as Record<string, unknown>);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Services retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getServiceBySlug = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceBySlug(req.params.slug as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Service retrieved successfully.", data: service });
});

const getServiceById = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.getServiceById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Service retrieved successfully.", data: service });
});

const updateService = catchAsync(async (req: Request, res: Response) => {
  const service = await serviceService.updateService(req.params.id as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Service updated successfully.", data: service });
});

const deleteService = catchAsync(async (req: Request, res: Response) => {
  await serviceService.deleteService(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Service deleted successfully.", data: null });
});

const addPackage = catchAsync(async (req: Request, res: Response) => {
  const pkg = await serviceService.addPackage(req.params.serviceId as string, req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Package added successfully.", data: pkg });
});

const updatePackage = catchAsync(async (req: Request, res: Response) => {
  const pkg = await serviceService.updatePackage(req.params.packageId as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Package updated successfully.", data: pkg });
});

const deletePackage = catchAsync(async (req: Request, res: Response) => {
  await serviceService.deletePackage(req.params.packageId as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Package deleted successfully.", data: null });
});

export const serviceController = {
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