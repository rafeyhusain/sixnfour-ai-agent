import { z } from "zod"
import { Table } from "./data";

export function parse<T>(item: T) {
  if (!item || typeof item !== "object" || !("type" in item)) {
    throw new Error("Item must have a 'type' property");
  }

  switch ((item as any).type) {
    case Table.CampaignTasks:
      return campaignTaskSchema.parse(item);
    case Table.Settings:
      return settingSchema.parse(item);
    case Table.Schedules:
      return scheduleSchema.parse(item);
    case Table.CampaignTypes:
      return campaignTypeSchema.parse(item);
    case Table.Campaigns:
      return campaignSchema.parse(item);
    case Table.ExampleTable:
      return exampleTableSchema.parse(item);
    default:
      throw new Error(`Unknown type: ${(item as any).type}`);
  }
}

export const exampleTableSchema = z.object({
  id: z.string(),
});

export type ExampleTable = z.infer<typeof exampleTableSchema>;

export const campaignTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  campaign: z.string(),
  lead: z.number(),
  type: z.string(),
  status: z.string(),
  folder: z.string(),
});

export type CampaignTask = z.infer<typeof campaignTaskSchema>;

export const settingSchema = z.object({
  id: z.string(),
  description: z.string(),
  value: z.string(),
});

export type Setting = z.infer<typeof settingSchema>;

export const scheduleSchema = z.object({
  id: z.string(),
  description: z.string(),
  url: z.string(),
  cron: z.string(),
});

export type Schedule = z.infer<typeof scheduleSchema>;

export const campaignTypeSchema = z.object({
  id: z.string(),
  description: z.string(),
  lead: z.number(),
});

export type CampaignType = z.infer<typeof campaignTypeSchema>;

export const campaignSchema = z.object({
  id: z.string(),
  event: z.string(),
  theme: z.string(),
  start: z.object({
    date: z.string(),
    time: z.string(),
  }),
  end: z.object({
    date: z.string(),
    time: z.string(),
  }),
  type: z.string(),
  channels: z.array(z.string()),
});

export type Campaign = z.infer<typeof campaignSchema>;

export const promptSchema = z.object({
  id: z.string(),
  value: z.string(),
});

export type Prompt = z.infer<typeof promptSchema>;
