import AppError from "../../errors/appError";
import { auth } from "../../../lib/auth";
import { AUTH_FALLBACK_MESSAGES } from "./auth.const";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  SendOtpInput,
  VerifyOtpInput,
  SignInOtpInput,
  ResetPasswordOtpInput,
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
        // @ts-ignore Better Auth accepts additional fields
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

const forgotPassword = (payload: ForgotPasswordInput, headers?: Headers) =>
  callAuthEndpoint(
    auth.api.requestPasswordReset({
      body: { email: payload.email, redirectTo: payload.redirectTo },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.FORGOT_PASSWORD,
  );

const resetPassword = (payload: ResetPasswordInput, headers?: Headers) =>
  callAuthEndpoint(
    auth.api.resetPassword({
      body: { newPassword: payload.newPassword, token: payload.token },
      headers,
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

const sendSignInOTP = (payload: SendOtpInput, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.sendVerificationOTP({
      body: { email: payload.email, type: payload.type },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.SEND_OTP,
  );

const verifyEmailOTP = (payload: VerifyOtpInput, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.verifyEmailOTP({
      body: { email: payload.email, otp: payload.otp },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.VERIFY_OTP,
  );

const checkVerificationOTP = (payload: VerifyOtpInput, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.checkVerificationOTP({
      body: { email: payload.email, type: payload.type, otp: payload.otp },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.VERIFY_OTP,
  );

const signInWithOTP = (payload: SignInOtpInput, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.signInEmailOTP({
      body: {
        email: payload.email,
        otp: payload.otp,
        ...(payload.name ? { name: payload.name } : {}),
        ...(payload.image ? { image: payload.image } : {}),
      },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.SIGN_IN_OTP,
  );

const requestPasswordResetOTP = (payload: { email: string }, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.requestPasswordResetEmailOTP({
      body: { email: payload.email },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.SEND_OTP,
  );

const resetPasswordWithOTP = (payload: ResetPasswordOtpInput, headers?: Headers) =>
  callAuthEndpoint(
    // @ts-ignore emailOTP plugin endpoint
    auth.api.resetPasswordEmailOTP({
      body: {
        email: payload.email,
        otp: payload.otp,
        password: payload.password,
      },
      headers,
      asResponse: true,
    }),
    AUTH_FALLBACK_MESSAGES.RESET_PASSWORD_OTP,
  );

export const authService = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  sendSignInOTP,
  verifyEmailOTP,
  checkVerificationOTP,
  signInWithOTP,
  requestPasswordResetOTP,
  resetPasswordWithOTP,
};
