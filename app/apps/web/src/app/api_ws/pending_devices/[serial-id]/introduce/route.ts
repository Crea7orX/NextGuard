import {
  pendingDeviceIntroduceSchema,
  pendingDeviceResponseSchema,
  type PendingDeviceIntroduceSchema,
} from "@repo/validations/websockets/pending-devices";
import type { NextRequest } from "next/server";
import { authenticateWSServer } from "~/lib/auth-utils";
import { BadRequestError, handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { introducePendingDeviceBySerialId__unprotected } from "~/server/db/queries/pending-devices";

interface Props {
  params: Promise<{
    "serial-id": string;
  }>;
}

// set device public key by serial id
export async function POST(request: NextRequest, { params }: Props) {
  try {
    await authenticateWSServer(request);

    const { "serial-id": serialId } = await params;
    if (!serialId) throw new BadRequestError();

    const json = (await request.json()) as PendingDeviceIntroduceSchema;
    const introduce = pendingDeviceIntroduceSchema.parse(json);

    const pendingDevice = await introducePendingDeviceBySerialId__unprotected({
      serialId: serialId,
      publicKey: introduce.publicKeyPem,
    });
    if (!pendingDevice) throw new NotFoundError();

    return createSuccessResponse(
      pendingDeviceResponseSchema.parse(pendingDevice),
    );
  } catch (error) {
    return handleError(error);
  }
}
