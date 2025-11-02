import { z } from "zod";

export const deviceTypes = ["hub", "entry"] as const;

export const deviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.string(),
  type: z.enum(deviceTypes),
  publicKeyPem: z.string(),
});

export type DeviceResponseSchema = z.infer<typeof deviceResponseSchema>;

export const deviceTelemetrySchema = z.object({
  system: z.object({
    firmware: z.string(),
    uptime: z.number(),
    reset_reason: z.string(),
    chip_model: z.string(),
    chip_cores: z.number(),
    chip_revision: z.number(),
    chip_features: z.number(),
  }),
  cpu: z.object({
    freq_mhz: z.number(),
    temp_c: z.number(),
    cores: z.number(),
  }),
  memory: z.object({
    heap_total: z.number(),
    heap_free: z.number(),
    heap_min_free: z.number(),
    heap_max_alloc: z.number(),
  }),
  network: z.object({
    ip_address: z.string(),
    mac_address: z.string(),
    network_mode: z.enum(["ethernet", "wifi", "none"]),
    wifi_rssi: z.number().optional(),
    wifi_ssid: z.string().optional(),
    wifi_channel: z.number().optional(),
    eth_speed_mbps: z.number().optional(),
    eth_full_duplex: z.boolean().optional(),
  }),
});

export type DeviceTelemetrySchema = z.infer<typeof deviceTelemetrySchema>;
