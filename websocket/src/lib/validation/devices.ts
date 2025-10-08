import { z } from "zod";

export const deviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.string(),
  type: z.string(),
  publicKeyPem: z.string(),
});

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;
