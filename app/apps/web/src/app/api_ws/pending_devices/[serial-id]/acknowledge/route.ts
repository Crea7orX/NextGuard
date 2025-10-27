import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { pendingDeviceResponseSchema } from "~/lib/validation/websockets/pending-devices";
import { acknowledgePendingDeviceBySerialId__unprotected } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// acknowledge device by serial id
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const pendingDevice = await acknowledgePendingDeviceBySerialId__unprotected(
      {
        serialId: serialId,
      },
    );
    if (!pendingDevice) throw new NotFoundError();

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
