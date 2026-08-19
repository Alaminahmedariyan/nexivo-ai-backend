import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { portfolioService } from "./portfolio.service";

const createPortfolio = catchAsync(async (req: Request, res: Response) => {
  const portfolio = await portfolioService.createPortfolio(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Portfolio created successfully.", data: portfolio });
});

const getAllPortfolios = catchAsync(async (req: Request, res: Response) => {
  const result = await portfolioService.getAllPortfolios(req.query as Record<string, unknown>);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Portfolios retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getPortfolioBySlug = catchAsync(async (req: Request, res: Response) => {
  const portfolio = await portfolioService.getPortfolioBySlug(req.params.slug as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Portfolio retrieved successfully.", data: portfolio });
});

const updatePortfolio = catchAsync(async (req: Request, res: Response) => {
  const portfolio = await portfolioService.updatePortfolio(req.params.id as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Portfolio updated successfully.", data: portfolio });
});

const deletePortfolio = catchAsync(async (req: Request, res: Response) => {
  await portfolioService.deletePortfolio(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Portfolio deleted successfully.", data: null });
});

const addImage = catchAsync(async (req: Request, res: Response) => {
  const image = await portfolioService.addImage(req.params.portfolioId as string, req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Image added successfully.", data: image });
});

const removeImage = catchAsync(async (req: Request, res: Response) => {
  await portfolioService.removeImage(req.params.imageId as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Image removed successfully.", data: null });
});

const addTechnology = catchAsync(async (req: Request, res: Response) => {
  const link = await portfolioService.addTechnology(
    req.params.portfolioId as string,
    req.params.technologyId as string,
  );
  res.status(StatusCodes.CREATED).json({ success: true, message: "Technology linked successfully.", data: link });
});

const removeTechnology = catchAsync(async (req: Request, res: Response) => {
  await portfolioService.removeTechnology(req.params.portfolioId as string, req.params.technologyId as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Technology unlinked successfully.", data: null });
});

export const portfolioController = {
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