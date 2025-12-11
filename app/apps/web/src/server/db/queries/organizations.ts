import { and, eq } from "drizzle-orm";
import { commandSirens } from "~/app/api_ws/devices/[serial-id]/message/route";
import { db } from "~/server/db";
import { getDevicesByType } from "~/server/db/queries/devices";
import { eventInsert } from "~/server/db/queries/events";
import { organization } from "~/server/db/schemas/organization";

interface getOrganizationByIdProps {
  id: string;
}

export async function getOrganizationById({ id }: getOrganizationByIdProps) {
  const [device] = await db
    .select()
    .from(organization)
    .where(and(eq(organization.id, id)))
    .limit(1);

  return device;
}

interface armOrganizationByIdProps {
  id: string;
  userId: string;
}

export async function armOrganizationById({
  id,
  userId,
}: armOrganizationByIdProps) {
  // TODO: Check permissions access

  await db
    .update(organization)
    .set({
      armed: true,
    })
    .where(and(eq(organization.id, id)))
    .returning();

  void eventInsert({
    ownerId: id,
    action: "organization:arm",
    actorName: "Hristiyan Dimitrov",
    actorId: userId,
    objectId: id,
    title: "Space armed",
    description: "Hristiyan Dimitrov armed the space!",
  });
}

interface activateOrganizationSirenByIdProps {
  id: string;
  userId: string;
}

export async function disarmOrganizationById({
  id,
  userId,
}: activateOrganizationSirenByIdProps) {
  // TODO: Check permissions access

  await db
    .update(organization)
    .set({
      armed: false,
      sirenActive: false,
    })
    .where(and(eq(organization.id, id)))
    .returning();

  const hubs = await getDevicesByType({
    type: "hub",
    ownerId: id,
  });

  for (const hub of hubs) {
    commandSirens(id, hub.serialId, false);
  }

  void eventInsert({
    ownerId: id,
    action: "organization:disarm",
    actorName: "Hristiyan Dimitrov",
    actorId: userId,
    objectId: id,
    title: "Space disarmed",
    description: "Hristiyan Dimitrov disarmed the space!",
  });
}

interface activateOrganizationSirenByIdProps {
  id: string;
  userId: string;
}

export async function activateOrganizationSirenById({
  id,
}: activateOrganizationSirenByIdProps) {
  // TODO: Check permissions access

  await db
    .update(organization)
    .set({
      sirenActive: true,
    })
    .where(and(eq(organization.id, id)))
    .returning();
}
