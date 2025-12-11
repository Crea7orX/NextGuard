import { desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { events } from "~/server/db/schemas/events";

interface getEventsProps {
  ownerId: string;
}

export async function getEvents({ ownerId }: getEventsProps) {
  return db
    .select()
    .from(events)
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.createdAt))
    .limit(5);
}

interface eventInsertProps {
  ownerId: string;
  action: string;
  actorName: string;
  actorId: string;
  objectId?: string;
  reference?: object;
  title: string;
  description: string;
}

export async function eventInsert({
  ownerId,
  action,
  actorName,
  actorId,
  objectId,
  reference,
  title,
  description,
}: eventInsertProps) {
  await db
    .insert(events)
    .values({
      action,
      actorName,
      actorId,
      objectId,
      title,
      description,
      reference,
      ownerId,
    })
    .returning();

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    body: JSON.stringify({
      to: "ExponentPushToken[6uL2vDAX_1Ye_iOTcHq1OT]",
      title,
      body: description,
      sound: "default",
      priority: "high",
      channelId: "alerts",
    }),
  });

  console.log(response);
}
