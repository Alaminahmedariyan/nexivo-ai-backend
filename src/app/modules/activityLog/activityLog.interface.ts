export type LogActivityInput = {
  userId?: string;

  action:
    | "created"
    | "updated"
    | "deleted"
    | "status_changed";

  entityType: string;

  entityId: string;

  metadata?: Record<string, unknown>;
};