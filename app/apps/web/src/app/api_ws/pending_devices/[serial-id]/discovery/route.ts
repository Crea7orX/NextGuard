import {
  pendingDeviceDiscoverySchema,
  pendingDeviceResponseSchema,
  type PendingDeviceDiscoverySchema,
} from "@repo/validations/websockets/pending-devices";
import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { discoverPendingDeviceBySerialId__unprotected } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// Add auto discovered device
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const json = (await request.json()) as PendingDeviceDiscoverySchema;
    const discovery = pendingDeviceDiscoverySchema.parse(json);

    const pendingDevice = await discoverPendingDeviceBySerialId__unprotected({
      serialId: serialId,
      discovery,
    });
    if (!pendingDevice) throw new NotFoundError();

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
