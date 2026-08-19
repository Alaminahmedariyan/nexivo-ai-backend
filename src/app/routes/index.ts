import { Router } from "express";

import { authRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { leadRoutes } from "../modules/lead/lead.routes";
import { clientRoutes } from "../modules/client/client.routes";
import { projectRoutes } from "../modules/project/project.routes";
import { notificationRoutes } from "../modules/notification/notification.routes";
import { activityLogRoutes } from "../modules/activityLog/activityLog.routes";
import { projectFileRoutes } from "../modules/projectFile/projectFile.routes";
import { serviceRoutes } from "../modules/service/service.routes";
import { technologyRoutes } from "../modules/technology/technology.routes";
import { portfolioRoutes } from "../modules/portfolio/portfolio.routes";
import { siteSettingRoutes } from "../modules/siteSetting/siteSetting.routes";
import { newsletterRoutes } from "../modules/newsletter/newsletter.routes";
import { aiRoutes } from "../modules/ai/ai.routes";
import { invoiceRoutes } from "../modules/invoice/invoice.routes";
import { paymentRoutes } from "../modules/payment/payment.routes";
import { testimonialRoutes } from "../modules/testimonial/testimonial.routes";
import { apiKeyRoutes } from "../modules/apiKey/apiKey.routes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: authRoutes },
  { path: "/users", route: userRoutes },
  { path: "/leads", route: leadRoutes },
  { path: "/clients", route: clientRoutes },
  { path: "/projects", route: projectRoutes },
  { path: "/notifications", route: notificationRoutes },
  { path: "/activity-logs", route: activityLogRoutes },
  { path: "/project-files", route: projectFileRoutes },
  { path: "/services", route: serviceRoutes },
  { path: "/technologies", route: technologyRoutes },
  { path: "/portfolios", route: portfolioRoutes },
  { path: "/site-settings", route: siteSettingRoutes },
  { path: "/newsletter", route: newsletterRoutes },
  { path: "/ai", route: aiRoutes },
  { path: "/invoices", route: invoiceRoutes },
  { path: "/payments", route: paymentRoutes },
  { path: "/api-keys", route: apiKeyRoutes },
  { path: "/testimonials", route: testimonialRoutes },
] as const;

moduleRoutes.forEach(({ path, route }) => {
  router.use(path, route);
});

export const globalRoutes = router;