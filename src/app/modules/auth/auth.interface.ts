export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type ForgotPasswordInput = {
  email: string;
  redirectTo?: string;
};

export type ResetPasswordInput = {
  token: string;
  newPassword: string;
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
};

export type SendOtpInput = {
  email: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
};

export type VerifyOtpInput = {
  email: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
  otp: string;
};

export type SignInOtpInput = {
  email: string;
  otp: string;
  name?: string;
  image?: string;
};

export type ResetPasswordOtpInput = {
  email: string;
  otp: string;
  password: string;
};

export type ChangeEmailOtpInput = {
  newEmail: string;
  otp: string;
};