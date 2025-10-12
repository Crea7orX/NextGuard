import { z } from "zod";
import { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

export const deviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.string(),
  type: z.enum(deviceTypeEnum.enumValues),
  publicKeyPem: z.string(),
});

export type DeviceResponseSchema = z.infer<typeof deviceResponseSchema>;
