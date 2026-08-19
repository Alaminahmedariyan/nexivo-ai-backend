import { Resend } from "resend";
import config from "../config";

const resend = new Resend(config.resend.apiKey);

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

// Intentionally swallows errors instead of throwing — a failed email
// shouldn't fail the request that triggered it (e.g. registration should
// still succeed even if the verification email doesn't go out; the user
// can request a resend later).
export const sendEmail = async ({ to, subject, html }: SendEmailInput) => {
  try {
    await resend.emails.send({
      from: config.resend.fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
  }
};