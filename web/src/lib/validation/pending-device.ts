import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";
import { z } from "zod";
import { getSortingStateParser } from "~/lib/parsers";
import {
  deviceTypeEnum,
  pendingDeviceState,
} from "~/server/db/schemas/pending-devices";

export const pendingDeviceCreateSchema = z.object({
  serialId: z.uuid(),
});

export type PendingDeviceCreate = z.infer<typeof pendingDeviceCreateSchema>;

export const pendingDeviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.uuid(),
  type: z.enum(deviceTypeEnum.enumValues),
  state: z.enum(pendingDeviceState.enumValues),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type PendingDeviceResponse = z.infer<typeof pendingDeviceResponseSchema>;

export const pendingDevicesSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<PendingDeviceResponse>().withDefault([
    { id: "state", desc: false },
    { id: "createdAt", desc: true },
  ]),
  serialId: parseAsString.withDefault(""),
  type: parseAsArrayOf(
    parseAsStringEnum(deviceTypeEnum.enumValues),
  ).withDefault([]),
  state: parseAsArrayOf(
    parseAsStringEnum(pendingDeviceState.enumValues),
  ).withDefault([]),
});

export type PendingDeviceSearchParams = Awaited<
  ReturnType<typeof pendingDevicesSearchParamsCache.parse>
>;

export const pendingDevicesPaginatedResponseSchema = z.object({
  data: pendingDeviceResponseSchema.array(),
  pageCount: z.number(),
});

export type PendingDevicesPaginatedResponse = z.infer<
  typeof pendingDevicesPaginatedResponseSchema
>;

export const pendingDeviceConfirmSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().optional(),
});

export type PendingDeviceConfirm = z.infer<typeof pendingDeviceConfirmSchema>;
