import { and, eq } from "drizzle-orm";
import { getDeviceTypeFromSerialId } from "~/lib/device-utils";
import { BadRequestError, ConflictError } from "~/lib/errors";
import type { PendingDeviceCreate } from "~/lib/validation/pending-device";
import { db } from "~/server/db";
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
  ownerId: string;
}

export function getPendingDevices({ ownerId }: getPendingDevicesProps) {
  return db
    .select()
    .from(pendingDevices)
    .where(
      eq(pendingDevices.ownerId, ownerId), // ownership
    )
    .orderBy(pendingDevices.createdAt);
}

interface deletePendingDeviceProps {
  deviceId: string;
  ownerId: string;
  userId: string;
}

export async function deletePendingDevice({
  deviceId,
  ownerId,
}: deletePendingDeviceProps) {
  const [deletedDevice] = await db
    .delete(pendingDevices)
    .where(
      and(
        eq(pendingDevices.id, deviceId),
        eq(pendingDevices.ownerId, ownerId), // ownership
      ),
    )
    .returning({ id: pendingDevices.id });

  return !!deletedDevice;
}

interface getPendingDeviceBySerialId__unprotectedProps {
  serialId: string;
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
