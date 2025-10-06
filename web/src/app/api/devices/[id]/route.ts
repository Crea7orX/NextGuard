import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { deviceResponseSchema } from "~/lib/validation/devices";
import { getDeviceById } from "~/server/db/queries/devices";

interface Props {
  params: Promise<{ id: string }>;
}

// get device by id
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "devices:read",
    );

    const { id } = await params;

    const device = await getDeviceById({
      id,
      ownerId: authResult.ownerId,
    });
    if (!device) throw new NotFoundError();

    return createSuccessResponse(deviceResponseSchema.parse(device));
  } catch (error) {
    return handleError(error);
  }
}
