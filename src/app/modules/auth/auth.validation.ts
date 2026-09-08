import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address."),
  redirectTo: z.string().optional(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "Password must be at least 8 characters."),
  revokeOtherSessions: z.boolean().optional(),
});

const sendOtpSchema = z.object({
  email: z.string().email("Invalid email address."),
  type: z.enum(["sign-in", "email-verification", "forget-password", "change-email"]),
});

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email address."),
  type: z.enum(["sign-in", "email-verification", "forget-password", "change-email"]),
  otp: z.string().min(1, "OTP is required."),
});

const signInOtpSchema = z.object({
  email: z.string().email("Invalid email address."),
  otp: z.string().min(1, "OTP is required."),
  name: z.string().optional(),
  image: z.string().optional(),
});

const requestPasswordResetOtpSchema = z.object({
  email: z.string().email("Invalid email address."),
});

const resetPasswordOtpSchema = z.object({
  email: z.string().email("Invalid email address."),
  otp: z.string().min(1, "OTP is required."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const authValidation = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
  signInOtpSchema,
  requestPasswordResetOtpSchema,
  resetPasswordOtpSchema,
};
