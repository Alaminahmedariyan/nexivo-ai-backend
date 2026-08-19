import type {
  NotificationType,
  NotificationEntityType,
} from "../../../../generated/prisma";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  entityType?: NotificationEntityType;
  entityId?: string;
  link?: string;
};
