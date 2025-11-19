import { deviceSessionResponseSchema } from "@repo/validations/websockets/devices";
import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import {
  getDeviceBySerialId__unprotected,
  getDevicesNotByType__unprotected,
} from "~/server/db/queries/devices";

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

    const nodeDevices = await getDevicesNotByType__unprotected({
      notType: "hub",
    });
    const nodes = [];
    for (const node of nodeDevices) {
      nodes.push({
        serialId: node.serialId,
        sharedSecret: node.publicKeyPem,
      });
    }

    return createSuccessResponse(
      deviceSessionResponseSchema.parse({ ...device, nodes }),
    );
  } catch (error) {
    return handleError(error);
  }
}
