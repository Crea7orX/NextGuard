import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import {
  deviceResponseSchema,
  deviceTelemetrySchema,
  type DeviceTelemetrySchema,
} from "~/lib/validation/websockets/devices";
import { setDeviceTelemetryBySerialId__unprotected } from "~/server/db/queries/devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// set device telemetry
export async function PATCH(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const json = (await request.json()) as DeviceTelemetrySchema;
    const telemetry = deviceTelemetrySchema.parse(json);

    const device = await setDeviceTelemetryBySerialId__unprotected({
      serialId: serialId,
      telemetry,
    });
    if (!device) throw new NotFoundError();

    return createSuccessResponse(deviceResponseSchema.parse(device));
  } catch (error) {
    return handleError(error);
  }
}
