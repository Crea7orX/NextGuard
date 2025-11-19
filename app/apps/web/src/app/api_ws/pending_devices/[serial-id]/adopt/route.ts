import {
  nodeAdoptionSchema,
  type NodeAdoption,
} from "@repo/validations/websockets/adoptions";
import { pendingDeviceResponseSchema } from "@repo/validations/websockets/pending-devices";
import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { adoptNodeBySerialId__unprotected } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// Adopt pending device
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const json = (await request.json()) as NodeAdoption;
    const adoption = nodeAdoptionSchema.parse(json);

    const pendingDevice = await adoptNodeBySerialId__unprotected({
      serialId: adoption.serialId,
      adoption,
    });
    if (!pendingDevice) throw new NotFoundError();

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
