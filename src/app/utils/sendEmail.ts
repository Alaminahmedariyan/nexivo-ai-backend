import nodemailer from "nodemailer";
import config from "../config";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

const transporter = config.smtp.host
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    })
  : null;

export const sendEmail = async ({ to, subject, html }: SendEmailInput) => {
  if (!transporter) {
    console.warn("[Email] SMTP not configured. Email not sent:", { to, subject });
    return;
  }

  try {
    await transporter.sendMail({
      from: config.resend.fromEmail,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
  }
};
