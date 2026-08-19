import type {
  NotificationType,
  NotificationEntityType,
} from "../../../../generated/prisma/enums";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  entityType?: NotificationEntityType;
  entityId?: string;
  link?: string;
};