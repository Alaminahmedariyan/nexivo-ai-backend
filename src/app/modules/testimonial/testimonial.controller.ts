import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { testimonialService } from "./testimonial.service";

const createTestimonial = catchAsync(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.createTestimonial(req.body);
  res.status(StatusCodes.CREATED).json({ success: true, message: "Testimonial created successfully.", data: testimonial });
});

const getAllTestimonials = catchAsync(async (req: Request, res: Response) => {
  const result = await testimonialService.getAllTestimonials(req.query as Record<string, unknown>);
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Testimonials retrieved successfully.",
    meta: result.meta,
    data: result.data,
  });
});

const getTestimonialById = catchAsync(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.getTestimonialById(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Testimonial retrieved successfully.", data: testimonial });
});

const updateTestimonial = catchAsync(async (req: Request, res: Response) => {
  const testimonial = await testimonialService.updateTestimonial(req.params.id as string, req.body);
  res.status(StatusCodes.OK).json({ success: true, message: "Testimonial updated successfully.", data: testimonial });
});

const deleteTestimonial = catchAsync(async (req: Request, res: Response) => {
  await testimonialService.deleteTestimonial(req.params.id as string);
  res.status(StatusCodes.OK).json({ success: true, message: "Testimonial deleted successfully.", data: null });
});

export const testimonialController = {
  createTestimonial,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
};