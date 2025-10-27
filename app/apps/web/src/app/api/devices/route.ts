import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import {
  devicesPaginatedResponseSchema,
  devicesSearchParamsCache,
} from "~/lib/validation/devices";
import { getDevices } from "~/server/db/queries/devices";

// get all devices
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "devices:read",
    );

    const url = new URL(request.url);
    const searchParams = await devicesSearchParamsCache.parse(
      Promise.resolve(url.searchParams),
    );

    const devices = await getDevices({
      searchParams,
      ownerId: authResult.ownerId,
    });
    return createSuccessResponse(devicesPaginatedResponseSchema.parse(devices));
  } catch (error) {
    return handleError(error);
  }
}
