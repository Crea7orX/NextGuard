import { z } from "zod";
import { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

export const pendingDeviceCreateSchema = z.object({
  serialId: z.uuid(),
});

export type PendingDeviceCreate = z.infer<typeof pendingDeviceCreateSchema>;

export const pendingDeviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.uuid(),
  type: z.enum(deviceTypeEnum.enumValues),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type PendingDeviceResponse = z.infer<typeof pendingDeviceResponseSchema>;
