export const verificationEmailTemplate = (name: string, url: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <h2>Verify your email</h2>
    <p>Hi ${name},</p>
    <p>Thanks for signing up for Nexivo AI. Please verify your email address to activate your account.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
    <p style="font-size: 13px; color: #666;">If the button doesn't work, copy this link: ${url}</p>
  </div>
`;

export const otpEmailTemplate = (name: string, otp: string, type: string) => {
  const titles: Record<string, string> = {
    "sign-in": "Sign in to Nexivo AI",
    "email-verification": "Verify your email",
    "forget-password": "Reset your password",
    "change-email": "Confirm your new email",
  };
  const messages: Record<string, string> = {
    "sign-in": "Use the following OTP to sign in to your Nexivo AI account. This code expires in 5 minutes.",
    "email-verification": "Use the following OTP to verify your email address. This code expires in 5 minutes.",
    "forget-password": "Use the following OTP to reset your Nexivo AI password. This code expires in 5 minutes.",
    "change-email": "Use the following OTP to confirm your new email address. This code expires in 5 minutes.",
  };
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
      <h2>${titles[type] || "Your OTP Code"}</h2>
      <p>Hi ${name},</p>
      <p>${messages[type] || "Use the following OTP to continue."}</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f5f5f5; border-radius: 8px; margin: 24px 0;">${otp}</p>
      <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;
};

export const resetPasswordEmailTemplate = (name: string, url: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. This link expires shortly for your security.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
    <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;