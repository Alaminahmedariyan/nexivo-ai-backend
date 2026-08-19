import type {
  ProjectCurrency,
  ProjectMemberRole,
  ProjectStatus,
} from "../../../../generated/prisma/enums";

export interface CreateProjectInput {
  clientId: string;
  title: string;
  description: string;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  currency?: ProjectCurrency;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  dueDate?: Date;
  budget?: number;
  currency?: ProjectCurrency;
}

export interface AddProjectMemberInput {
  userId: string;
  projectRole: ProjectMemberRole;
}