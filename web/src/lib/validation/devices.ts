import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import z from "zod";
import { getSortingStateParser } from "~/lib/parsers";
import { deviceTypeEnum } from "~/server/db/schemas/pending-devices";

export const deviceTelemetrySchema = z.object({
  system: z
    .object({
      firmware: z.string(),
      uptime: z.number(),
      reset_reason: z.string(),
      chip_model: z.string(),
      chip_cores: z.number(),
      chip_revision: z.number(),
      chip_features: z.number(),
    })
    .transform((data) => ({
      firmware: data.firmware,
      uptime: data.uptime,
      resetReason: data.reset_reason,
      chipModel: data.chip_model,
      chipCores: data.chip_cores,
      chipRevision: data.chip_revision,
      chipFeatures: data.chip_features,
    })),
  cpu: z
    .object({
      freq_mhz: z.number(),
      temp_c: z.number(),
      cores: z.number(),
    })
    .transform((data) => ({
      freqMhz: data.freq_mhz,
      tempC: data.temp_c,
      cores: data.cores,
    })),
  memory: z
    .object({
      heap_total: z.number(),
      heap_free: z.number(),
      heap_min_free: z.number(),
      heap_max_alloc: z.number(),
    })
    .transform((data) => ({
      heapTotal: data.heap_total,
      heapFree: data.heap_free,
      heapMinFree: data.heap_min_free,
      heapMaxAlloc: data.heap_max_alloc,
    })),
  network: z
    .object({
      ip_address: z.string(),
      mac_address: z.string(),
      network_mode: z.enum(["ethernet", "wifi", "none"]),
      wifi_rssi: z.number().optional(),
      wifi_ssid: z.string().optional(),
      wifi_channel: z.number().optional(),
      eth_speed_mbps: z.number().optional(),
      eth_full_duplex: z.boolean().optional(),
    })
    .transform((data) => ({
      ipAddress: data.ip_address,
      macAddress: data.mac_address,
      networkMode: data.network_mode,
      wifiRssi: data.wifi_rssi,
      wifiSsid: data.wifi_ssid,
      wifiChannel: data.wifi_channel,
      ethSpeedMbps: data.eth_speed_mbps,
      ethFullDuplex: data.eth_full_duplex,
    })),
});

export type DeviceTelemetry = z.infer<typeof deviceTelemetrySchema>;

export const deviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.uuid(),
  type: z.enum(deviceTypeEnum.enumValues),
  name: z.string(),
  description: z.string().nullish(),
  metadata: z.object({
    telemetry: z.object(deviceTelemetrySchema.shape).optional(),
  }),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().nullish(),
});

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;

export const deviceUpdateSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z
    .string()
    .min(2)
    .max(255)
    .or(z.literal("").transform(() => null))
    .nullish(),
});

export type DeviceUpdate = z.infer<typeof deviceUpdateSchema>;

export const devicesSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<DeviceResponse>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  serialId: parseAsString.withDefault(""),
  type: parseAsArrayOf(
    parseAsStringEnum(deviceTypeEnum.enumValues),
  ).withDefault([]),
  name: parseAsString.withDefault(""),
});

export type DeviceSearchParams = Awaited<
  ReturnType<typeof devicesSearchParamsCache.parse>
>;

export const devicesPaginatedResponseSchema = z.object({
  data: deviceResponseSchema.array(),
  pageCount: z.number(),
});

export type DevicesPaginatedResponse = z.infer<
  typeof devicesPaginatedResponseSchema
>;
