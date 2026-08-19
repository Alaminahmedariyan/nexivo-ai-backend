export const verificationEmailTemplate = (name: string, url: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <h2>Verify your email</h2>
    <p>Hi ${name},</p>
    <p>Thanks for signing up for Nexivo AI. Please verify your email address to activate your account.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Verify Email</a></p>
    <p style="font-size: 13px; color: #666;">If the button doesn't work, copy this link: ${url}</p>
  </div>
`;

export const resetPasswordEmailTemplate = (name: string, url: string) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #111;">
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset your password. This link expires shortly for your security.</p>
    <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
    <p style="font-size: 13px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
  </div>
`;