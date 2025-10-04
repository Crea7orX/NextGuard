import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { pendingDeviceResponseSchema } from "~/lib/validation/pending-device";
import { adoptPendingDevice } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{ id: string }>;
}

// adopt auto discovered device
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

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
