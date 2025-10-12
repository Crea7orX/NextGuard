import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { NotFoundError } from "~/lib/errors";
import type {
  DeviceSearchParams,
  DeviceUpdate,
} from "~/lib/validation/devices";
import type { DeviceTelemetrySchema } from "~/lib/validation/websockets/devices";
import { db } from "~/server/db";
import { devices } from "~/server/db/schemas/devices";

interface getDevicesProps {
  searchParams: DeviceSearchParams;
  ownerId: string;
}

export async function getDevices({ searchParams, ownerId }: getDevicesProps) {
  try {
    const offset = (searchParams.page - 1) * searchParams.perPage;

    const where = and(
      searchParams.serialId
        ? ilike(sql`${devices.serialId}::text`, `%${searchParams.serialId}%`)
        : undefined,
      searchParams.type && searchParams.type.length > 0
        ? inArray(devices.type, searchParams.type)
        : undefined,
      searchParams.name
        ? ilike(devices.name, `%${searchParams.name}%`)
        : undefined,
      eq(devices.ownerId, ownerId), // ownership
    );

    const orderBy =
      searchParams.sort.length > 0
        ? searchParams.sort.map((item) =>
            item.desc ? desc(devices[item.id]) : asc(devices[item.id]),
          )
        : [asc(devices.createdAt)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(devices)
        .limit(searchParams.perPage)
        .offset(offset)
        .where(where)
        .orderBy(...orderBy);

      const total = await tx
        .select({
          count: count(),
        })
        .from(devices)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return {
        data,
        total,
      };
    });

    const pageCount = Math.ceil(total / searchParams.perPage);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}

interface getDeviceByIdProps {
  id: string;
  ownerId: string;
}

export async function getDeviceById({ id, ownerId }: getDeviceByIdProps) {
  const [device] = await db
    .select()
    .from(devices)
    .where(
      and(
        eq(devices.id, id),
        eq(devices.ownerId, ownerId), // ownership
      ),
    )
    .limit(1);

  return device;
}

interface updateDeviceByIdProps {
  id: string;
  ownerId: string;
  userId: string;
  update: DeviceUpdate;
}

export async function updateDeviceById({
  id,
  ownerId,
  update,
}: updateDeviceByIdProps) {
  const [device] = await db
    .update(devices)
    .set({
      ...(typeof update.name === "string" && {
        name: update.name.trim(),
      }),
      ...(update.description !== undefined && {
        description:
          typeof update.description === "string"
            ? update.description.trim()
            : null,
      }),
    })
    .where(
      and(
        eq(devices.id, id),
        eq(devices.ownerId, ownerId), // ownership
      ),
    )
    .returning();

  return device;
}

interface getDeviceBySerialId__unprotectedProps {
  serialId: string;
}

export async function getDeviceBySerialId__unprotected({
  serialId,
}: getDeviceBySerialId__unprotectedProps) {
  const [device] = await db
    .select()
    .from(devices)
    .where(eq(devices.serialId, serialId))
    .limit(1);

  return device;
}

interface setDeviceTelemetryBySerialId__unprotectedProps {
  serialId: string;
  telemetry: DeviceTelemetrySchema;
}

export async function setDeviceTelemetryBySerialId__unprotected({
  serialId,
  telemetry,
}: setDeviceTelemetryBySerialId__unprotectedProps) {
  const device = await getDeviceBySerialId__unprotected({
    serialId,
  });
  if (!device) throw new NotFoundError();

  const metadata = device.metadata as Record<string, unknown>;
  const [updatedDevice] = await db
    .update(devices)
    .set({
      metadata: {
        ...metadata,
        telemetry,
      },
    })
    .where(and(eq(devices.id, device.id)))
    .returning();

  return updatedDevice;
}
