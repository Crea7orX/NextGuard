import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import {
  pendingDeviceCreateSchema,
  pendingDeviceResponseSchema,
  type PendingDeviceCreate,
} from "~/lib/validation/pending-device";
import {
  createPendingDevice,
  getPendingDevices,
} from "~/server/db/queries/pending-devices";

// get all devices for adoption
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:read",
    );

    const pendingDevices = await getPendingDevices({
      ownerId: authResult.ownerId,
    });
    return createSuccessResponse(
      pendingDeviceResponseSchema.array().parse(pendingDevices),
    );
  } catch (error) {
    return handleError(error);
  }
}

// register device for adoption
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:create",
    );

    const json = (await request.json()) as PendingDeviceCreate;
    const create = pendingDeviceCreateSchema.parse(json);

    const pendingDevice = await createPendingDevice({
      create,
      ownerId: authResult.ownerId,
      userId: authResult.user.id,
    });
    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
      201,
    );
  } catch (error) {
    return handleError(error);
  }
}
