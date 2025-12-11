import {
  MessageFromNode,
  messageFromNodeSchema,
} from "@repo/validations/websockets/messages";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { getDeviceTypeFromSerialId } from "~/lib/device-utils";
import { BadRequestError, handleError } from "~/lib/errors";
import { sendRequest } from "~/lib/requests";
import { createSuccessResponse } from "~/lib/responses";
import { db } from "~/server/db";
import { getDevicesByType } from "~/server/db/queries/devices";
import { eventInsert } from "~/server/db/queries/events";
import { devices } from "~/server/db/schemas/devices";
import { organization } from "~/server/db/schemas/organization";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// Message from node
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const json = (await request.json()) as MessageFromNode;
    const messageData = messageFromNodeSchema.parse(json);

    // const device = await setDeviceTelemetryBySerialId__unprotected({
    //   serialId: serialId,
    //   message,
    // });
    // if (!device) throw new NotFoundError();

    // return createSuccessResponse(deviceResponseSchema.parse(device));

    const deviceType = getDeviceTypeFromSerialId(messageData.serialId);
    if (!deviceType) throw new BadRequestError();

    const [hub] = await db
      .select()
      .from(devices)
      .where(eq(devices.serialId, serialId));
    if (!hub) throw new BadRequestError();

    const [space] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, hub.ownerId));
    if (!space) throw new BadRequestError();

    const message = messageData.message;
    if (message.startsWith("state;")) {
      const data = message.split(";") as [string, string, string, string];

      const state = data[3] === "true";

      if (
        deviceType === "entry" &&
        space.armed &&
        !state &&
        !space.sirenActive
      ) {
        commandSirens(space.id, serialId, true);
        updateSpaceSirensState(space.id, true);
      }

      if (deviceType === "siren" && space.sirenActive && !state) {
        commandSirens(space.id, serialId, true);
      }

      if (deviceType === "siren" && !space.sirenActive && state) {
        commandSirens(space.id, serialId, false);
      }
    } else if (message.startsWith("telemetry;")) {
      const data = message.split(";") as [string, string, string, string];

      const batteryVoltage = parseFloat(data[1]);
      const batteryPercentage = parseFloat(data[2]);
      const state = data[3] === "true";

      if (
        deviceType === "entry" &&
        space.armed &&
        !space.sirenActive &&
        !state
      ) {
        commandSirens(space.id, serialId, true);
        updateSpaceSirensState(space.id, true);
      }

      if (deviceType === "siren" && !state && space.sirenActive) {
        commandSirens(space.id, serialId, true);
      }

      if (deviceType === "siren" && state && !space.sirenActive) {
        commandSirens(space.id, serialId, false);
      }

      await db
        .update(devices)
        .set({
          metadata: {
            batteryPercentage,
            batteryVoltage,
            state,
            lastHeartbeatAt: new Date().getTime(),
          },
        })
        .where(eq(devices.serialId, messageData.serialId));
    }

    return createSuccessResponse({});
  } catch (error) {
    return handleError(error);
  }
}

export async function commandSirens(
  spaceId: string,
  serialId: string,
  state: boolean,
) {
  const sirens = await getDevicesByType({
    type: "siren",
    ownerId: spaceId,
  });

  for (const siren of sirens) {
    void sendRequest({
      method: "POST",
      path: "/send_message_to_node",
      body: {
        serialId,
        nodeSerialId: siren.serialId,
        message: `siren;${state}`,
      },
    });
  }
}

export async function updateSpaceSirensState(spaceId: string, state: boolean) {
  await db
    .update(organization)
    .set({
      sirenActive: state,
    })
    .where(eq(organization.id, spaceId));

  if (state) {
    void eventInsert({
      ownerId: spaceId,
      action: "entry_sensor:alert",
      actorName: "System",
      actorId: "system",
      objectId: spaceId,
      title: "Siren activated",
      description: "Front Door was opened, while the space is armed!",
    });
  }
}
