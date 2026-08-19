import type { SettingGroup } from "../../../../generated/prisma";

export type UpsertSettingInput = {
  key: string;
  value: unknown;
  group?: SettingGroup;
};
