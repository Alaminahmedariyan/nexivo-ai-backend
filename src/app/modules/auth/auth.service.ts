import AppError from "../../errors/appError";
import { auth } from "../../../lib/auth";
import { AUTH_FALLBACK_MESSAGES } from "./auth.const";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "./auth.interface";

const callAuthEndpoint = async (
  responsePromise: Promise<Response>,
  fallbackMessage: string,
) => {
  const response = await responsePromise;
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AppError(
      response.status,
      (data as { message?: string } | null)?.message ?? fallbackMessage,
    );
  }

  return { data, headers: response.headers };
};

const register = (payload: RegisterInput, headers: Headers) =>
  callAuthEndpoint(
    auth.api.signUpEmail({
      body: {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        phone: payload.phone,
      },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.REGISTER,
  );

const login = (payload: LoginInput, headers: Headers) =>
  callAuthEndpoint(
    auth.api.signInEmail({
      body: {
        email: payload.email,
        password: payload.password,
        rememberMe: payload.rememberMe,
      },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.LOGIN,
  );

const logout = (headers: Headers) =>
  callAuthEndpoint(auth.api.signOut({ headers, asResponse: true }), AUTH_FALLBACK_MESSAGES.LOGOUT);

const forgotPassword = (payload: ForgotPasswordInput) =>
  callAuthEndpoint(
    auth.api.requestPasswordReset({
      body: { email: payload.email, redirectTo: payload.redirectTo },
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.FORGOT_PASSWORD,
  );

const resetPassword = (payload: ResetPasswordInput) =>
  callAuthEndpoint(
    auth.api.resetPassword({
      body: { newPassword: payload.newPassword, token: payload.token },
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.RESET_PASSWORD,
  );

const changePassword = (payload: ChangePasswordInput, headers: Headers) =>
  callAuthEndpoint(
    auth.api.changePassword({
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: payload.revokeOtherSessions,
      },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.CHANGE_PASSWORD,
  );

export const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};