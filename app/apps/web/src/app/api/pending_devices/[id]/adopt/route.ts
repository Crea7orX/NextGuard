import { adoptionRequestSchema } from "@repo/validations/websockets/adoptions";
import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { ConflictError, handleError, NotFoundError } from "~/lib/errors";
import { sendRequest } from "~/lib/requests";
import { createSuccessResponse } from "~/lib/responses";
import { pendingDeviceResponseSchema } from "~/lib/validation/pending-device";
import { getDevicesByType } from "~/server/db/queries/devices";
import { adoptPendingDevice } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{ id: string }>;
}

// Adopt auto discovered device
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:create",
    );

    const { id } = await params;

    const pendingDevice = await adoptPendingDevice({
      id,
      ownerId: authResult.ownerId,
      userId: authResult.user.id,
    });
    if (!pendingDevice) throw new NotFoundError();

    const hubs = await getDevicesByType({
      type: "hub",
      ownerId: authResult.ownerId,
    });
    if (hubs.length === 0) throw new ConflictError();

    hubs.forEach(async (hub) => {
      const response = await sendRequest({
        method: "POST",
        path: "/adopt",
        body: adoptionRequestSchema.parse({
          serialId: hub.serialId,
          nodeSerialId: pendingDevice.serialId,
        }),
      });
    });

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
