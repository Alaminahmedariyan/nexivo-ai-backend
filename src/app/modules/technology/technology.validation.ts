import { z } from "zod";

const createTechnologySchema = z.object({ name: z.string().min(1), icon: z.string().optional() });
const updateTechnologySchema = z.object({ name: z.string().min(1).optional(), icon: z.string().optional() });

export const technologyValidation = { createTechnologySchema, updateTechnologySchema };