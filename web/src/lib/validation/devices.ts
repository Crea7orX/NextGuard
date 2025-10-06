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

export const deviceResponseSchema = z.object({
  id: z.string(),
  serialId: z.uuid(),
  type: z.enum(deviceTypeEnum.enumValues),
  name: z.string(),
  description: z.string().nullish(),
  metadata: z.object(),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().nullish(),
});

export type DeviceResponse = z.infer<typeof deviceResponseSchema>;

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
