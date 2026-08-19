import { z } from "zod";

const cuidSchema = (fieldName: string) =>
  z.string().cuid({ error: `Invalid ${fieldName}.` });

// ============================================================
// AI CONVERSATION
// ============================================================

const startConversationSchema = z.object({
  leadId: cuidSchema("lead ID").optional(),

  title: z
    .string()
    .trim()
    .max(150, { error: "Title must not exceed 150 characters." })
    .optional(),

  message: z
    .string({ error: "Message is required." })
    .trim()
    .min(1, { error: "Message is required." })
    .max(10000, { error: "Message must not exceed 10,000 characters." }),
});

const addMessageSchema = z.object({
  role: z.enum(["user", "assistant"], { error: "Role must be 'user' or 'assistant'." }),

  content: z
    .string({ error: "Message content is required." })
    .trim()
    .min(1, { error: "Message content is required." })
    .max(10000, { error: "Message must not exceed 10,000 characters." }),
});

// ============================================================
// AI PROPOSAL
// ============================================================

const createProposalSchema = z.object({
  leadId: cuidSchema("lead ID").optional(),
  clientId: cuidSchema("client ID").optional(),

  title: z
    .string({ error: "Proposal title is required." })
    .trim()
    .min(2, { error: "Proposal title must be at least 2 characters." })
    .max(200, { error: "Proposal title must not exceed 200 characters." }),

  content: z
    .string({ error: "Proposal content is required." })
    .trim()
    .min(10, { error: "Proposal content must be at least 10 characters." })
    .max(20000, { error: "Proposal content must not exceed 20,000 characters." }),

  amount: z.coerce
    .number({ error: "Amount must be a valid number." })
    .nonnegative({ error: "Amount cannot be negative." }),

  currency: z
    .enum(["USD", "EUR", "BDT"], { error: "Please select a valid currency." })
    .optional(),
});

const updateProposalStatusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED"], {
    error: "Please select a valid proposal status.",
  }),
});

// ============================================================
// AUTOMATION EXECUTION
// ============================================================

const logAutomationExecutionSchema = z.object({
  workflowName: z
    .string({ error: "Workflow name is required." })
    .trim()
    .min(1, { error: "Workflow name is required." })
    .max(150, { error: "Workflow name must not exceed 150 characters." }),

  triggerType: z
    .enum(["MANUAL", "SCHEDULE", "WEBHOOK"], { error: "Please select a valid trigger type." })
    .optional(),

  status: z
    .enum(["RUNNING", "SUCCESS", "FAILED"], { error: "Please select a valid status." })
    .optional(),

  executionTime: z.coerce
    .number()
    .int({ error: "Execution time must be a whole number." })
    .nonnegative({ error: "Execution time cannot be negative." })
    .optional(),

  error: z
    .string()
    .trim()
    .max(10000, { error: "Error message must not exceed 10,000 characters." })
    .optional(),

  userId: cuidSchema("user ID").optional(),
});

export const aiValidation = {
  startConversationSchema,
  addMessageSchema,
  createProposalSchema,
  updateProposalStatusSchema,
  logAutomationExecutionSchema,
};