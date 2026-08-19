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