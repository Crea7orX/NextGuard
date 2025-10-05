import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { hubResponseSchema } from "~/lib/validation/hubs";
import {
  pendingDeviceConfirmSchema,
  type PendingDeviceConfirm,
} from "~/lib/validation/pending-device";
import { confirmPendingDevice } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{ id: string }>;
}

// confirm pending device
export async function POST(request: NextRequest, { params }: Props) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:create",
    );

    const { id } = await params;

    const json = (await request.json()) as PendingDeviceConfirm;
    const confirm = pendingDeviceConfirmSchema.parse(json);

    const device = await confirmPendingDevice({
      id,
      ownerId: authResult.ownerId,
      userId: authResult.user.id,
      ...confirm,
    });
    if (!device) throw new Error(); // unsuccessful creation of device

    // TODO: return proper type based on device type
    return createSuccessResponse(hubResponseSchema.parse(device));
  } catch (error) {
    return handleError(error);
  }
}
