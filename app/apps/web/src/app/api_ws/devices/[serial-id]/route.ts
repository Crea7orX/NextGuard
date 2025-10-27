import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { deviceResponseSchema } from "~/lib/validation/websockets/devices";
import { getDeviceBySerialId__unprotected } from "~/server/db/queries/devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// get device by serial id
export async function GET(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const device = await getDeviceBySerialId__unprotected({
      serialId: serialId,
    });
    if (!device) throw new NotFoundError();

    return createSuccessResponse(deviceResponseSchema.parse(device));
  } catch (error) {
    return handleError(error);
  }
}
