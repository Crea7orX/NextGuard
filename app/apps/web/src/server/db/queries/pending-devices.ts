import type { PendingDeviceDiscoverySchema } from "@repo/validations/websockets/pending-devices";
import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { getDeviceTypeFromSerialId } from "~/lib/device-utils";
import { BadRequestError, ConflictError, NotFoundError } from "~/lib/errors";
import type {
  PendingDeviceCreate,
  PendingDeviceSearchParams,
} from "~/lib/validation/pending-device";
import { db } from "~/server/db";
import { getDeviceBySerialId__unprotected } from "~/server/db/queries/devices";
import { devices } from "~/server/db/schemas/devices";
import { pendingDevices } from "~/server/db/schemas/pending-devices";

interface createPendingDeviceProps {
  create: PendingDeviceCreate;
  ownerId: string;
  userId: string;
}

export async function createPendingDevice({
  create,
  ownerId,
}: createPendingDeviceProps) {
  const existingDevice = await getPendingDeviceBySerialId__unprotected({
    serialId: create.serialId,
  });
  if (existingDevice) throw new ConflictError();

  const type = getDeviceTypeFromSerialId(create.serialId);
  if (!type) throw new BadRequestError();

  const [device] = await db
    .insert(pendingDevices)
    .values({
      ...create,
      type,
      ownerId,
    })
    .returning();

  if (!device) {
    throw new Error();
  }

  return device;
}

interface getPendingDevicesProps {
  searchParams: PendingDeviceSearchParams;
  ownerId: string;
}

export async function getPendingDevices({
  searchParams,
  ownerId,
}: getPendingDevicesProps) {
  try {
    const offset = (searchParams.page - 1) * searchParams.perPage;

    const where = and(
      searchParams.serialId
        ? ilike(
            sql`${pendingDevices.serialId}::text`,
            `%${searchParams.serialId}%`,
          )
        : undefined,
      searchParams.type && searchParams.type.length > 0
        ? inArray(pendingDevices.type, searchParams.type)
        : undefined,
      eq(pendingDevices.ownerId, ownerId), // ownership
    );

    const orderBy =
      searchParams.sort.length > 0
        ? searchParams.sort.map((item) =>
            item.desc
              ? desc(pendingDevices[item.id])
              : asc(pendingDevices[item.id]),
          )
        : [asc(pendingDevices.createdAt)];

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select()
        .from(pendingDevices)
        .limit(searchParams.perPage)
        .offset(offset)
        .where(where)
        .orderBy(...orderBy);

      const total = await tx
        .select({
          count: count(),
        })
        .from(pendingDevices)
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
  } catch (error) {
    console.error(error);
    return { data: [], pageCount: 0 };
  }
}

interface getPendingDeviceByIdProps {
  id: string;
  ownerId: string;
}

export async function getPendingDeviceById({
  id,
  ownerId,
}: getPendingDeviceByIdProps) {
  const [device] = await db
    .select()
    .from(pendingDevices)
    .where(
      and(
        eq(pendingDevices.id, id),
        eq(pendingDevices.ownerId, ownerId), // ownership
      ),
    )
    .limit(1);

  return device;
}

interface deletePendingDeviceProps {
  id: string;
  ownerId: string;
  userId: string;
}

export async function deletePendingDevice({
  id,
  ownerId,
}: deletePendingDeviceProps) {
  const [deletedDevice] = await db
    .delete(pendingDevices)
    .where(
      and(
        eq(pendingDevices.id, id),
        eq(pendingDevices.ownerId, ownerId), // ownership
      ),
    )
    .returning();

  return deletedDevice;
}

interface adoptPendingDeviceProps {
  id: string;
  ownerId: string;
  userId: string;
}

export async function adoptPendingDevice({
  id,
  ownerId,
}: adoptPendingDeviceProps) {
  const pendingDevice = await getPendingDeviceById({ id, ownerId });
  if (pendingDevice?.state !== "auto_discovered") throw new ConflictError();

  const [device] = await db
    .update(pendingDevices)
    .set({
      state: "pending_introduce",
    })
    .where(
      and(
        eq(pendingDevices.id, id),
        eq(pendingDevices.ownerId, ownerId), // ownership
      ),
    )
    .returning();

  return device;
}

interface getPendingDeviceBySerialId__unprotectedProps {
  serialId: string;
}

interface confirmPendingDeviceProps {
  id: string;
  ownerId: string;
  userId: string;
  name: string;
  description?: string;
}

export async function confirmPendingDevice({
  id,
  ownerId,
  userId,
  ...props
}: confirmPendingDeviceProps) {
  const pendingDevice = await getPendingDeviceById({ id, ownerId });
  if (pendingDevice?.state !== "waiting_user_confirmation")
    throw new ConflictError();

  const deletedDevice = await deletePendingDevice({
    id,
    ownerId,
    userId,
  });
  if (!deletedDevice) throw new NotFoundError();

  const [device] = await db
    .insert(devices)
    .values({
      serialId: deletedDevice.serialId,
      type: deletedDevice.type,
      publicKeyPem: deletedDevice.publicKeyPem,
      ownerId,
      ...props,
    })
    .returning();

  return device;
}

export async function getPendingDeviceBySerialId__unprotected({
  serialId,
}: getPendingDeviceBySerialId__unprotectedProps) {
  const [device] = await db
    .select()
    .from(pendingDevices)
    .where(eq(pendingDevices.serialId, serialId))
    .limit(1);

  return device;
}

interface introducePendingDeviceBySerialId__unprotectedProps {
  serialId: string;
  publicKey: string;
}

export async function introducePendingDeviceBySerialId__unprotected({
  serialId,
  publicKey,
}: introducePendingDeviceBySerialId__unprotectedProps) {
  const pendingDevice = await getPendingDeviceBySerialId__unprotected({
    serialId,
  });
  if (pendingDevice?.publicKeyPem) throw new ConflictError();

  const [device] = await db
    .update(pendingDevices)
    .set({
      publicKeyPem: publicKey,
      state: "pending_acknowledgement",
    })
    .where(eq(pendingDevices.serialId, serialId))
    .returning();

  return device;
}

interface acknowledgePendingDeviceBySerialId__unprotectedProps {
  serialId: string;
}

export async function acknowledgePendingDeviceBySerialId__unprotected({
  serialId,
}: acknowledgePendingDeviceBySerialId__unprotectedProps) {
  const pendingDevice = await getPendingDeviceBySerialId__unprotected({
    serialId,
  });
  if (pendingDevice?.state !== "pending_acknowledgement")
    throw new ConflictError();

  const [device] = await db
    .update(pendingDevices)
    .set({
      state: "waiting_user_confirmation",
    })
    .where(eq(pendingDevices.serialId, serialId))
    .returning();

  return device;
}

interface discoverPendingDeviceBySerialId__unprotectedProps {
  serialId: string;
  discovery: PendingDeviceDiscoverySchema;
}

export async function discoverPendingDeviceBySerialId__unprotected({
  serialId,
  discovery,
}: discoverPendingDeviceBySerialId__unprotectedProps) {
  const hub = await getDeviceBySerialId__unprotected({ serialId });
  if (!hub) throw new NotFoundError();

  const existingPendingDevice = await getPendingDeviceBySerialId__unprotected({
    serialId: discovery.serialId,
  });
  if (existingPendingDevice) throw new ConflictError();

  const type = getDeviceTypeFromSerialId(discovery.serialId);
  if (!type) throw new BadRequestError();

  const [pendingDevice] = await db
    .insert(pendingDevices)
    .values({
      serialId: discovery.serialId,
      type,
      state: "auto_discovered",
      ownerId: hub.ownerId,
    })
    .returning();

  if (!pendingDevice) {
    throw new Error();
  }

  return pendingDevice;
}
