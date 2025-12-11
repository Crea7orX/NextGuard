import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { eventResponseSchema } from "~/lib/validation/events";
import { getEvents } from "~/server/db/queries/events";

// Get 5 recent events
export async function GET(request: NextRequest) {
  try {
    // TODO: Check permissions access
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "devices:read",
    );

    const events = await getEvents({
      ownerId: authResult.ownerId,
    });
    return createSuccessResponse(eventResponseSchema.array().parse(events));
  } catch (error) {
    return handleError(error);
  }
}
