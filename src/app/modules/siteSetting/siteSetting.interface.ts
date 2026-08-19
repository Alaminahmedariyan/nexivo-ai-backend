import type { SettingGroup } from "../../../../generated/prisma/enums";

export type UpsertSettingInput = {
  key: string;
  value: unknown;
  group?: SettingGroup;
};