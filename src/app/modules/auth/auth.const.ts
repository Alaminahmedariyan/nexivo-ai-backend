// Fallback error messages used when better-auth doesn't return one of its own.
export const AUTH_FALLBACK_MESSAGES = {
  REGISTER: "Registration failed.",
  LOGIN: "Invalid email or password.",
  LOGOUT: "Logout failed.",
  FORGOT_PASSWORD: "Could not process the forgot password request.",
  RESET_PASSWORD: "Password reset failed. The link may be invalid or expired.",
  CHANGE_PASSWORD: "Could not change password.",
} as const;