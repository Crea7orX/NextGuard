import { z } from "zod";

export const pendingDeviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.string(),
  publicKeyPem: z.string(),
});

export type PendingDeviceResponseSchema = z.infer<
  typeof pendingDeviceResponseSchema
>;

export const pendingDeviceIntroduceSchema = z.object({
  publicKeyPem: z.string().refine(
    (key) => {
      return (
        key.includes("-----BEGIN PUBLIC KEY-----") &&
        key.includes("-----END PUBLIC KEY-----")
      );
    },
    {
      message: "Public key must be in valid PEM format",
    },
  ),
});

export type PendingDeviceIntroduceSchema = z.infer<
  typeof pendingDeviceIntroduceSchema
>;

export const pendingDeviceDiscoverySchema = z.object({
  serialId: z.uuid(),
  rssi: z.number(),
  snr: z.number(),
});

export type PendingDeviceDiscoverySchema = z.infer<
  typeof pendingDeviceDiscoverySchema
>;
