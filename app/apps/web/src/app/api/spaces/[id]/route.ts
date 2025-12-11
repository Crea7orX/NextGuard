import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError, NotFoundError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { spaceResponseSchema } from "~/lib/validation/spaces";
import { getOrganizationById } from "~/server/db/queries/organizations";

interface Props {
  params: Promise<{ id: string }>;
}

// Get space by id
export async function GET(request: NextRequest, { params }: Props) {
  try {
    // TODO: Check permissions
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:read",
    );

    const { id } = await params;

    const space = await getOrganizationById({
      id,
    });
    if (!space) throw new NotFoundError();

    return createSuccessResponse(spaceResponseSchema.parse(space));
  } catch (error) {
    return handleError(error);
  }
}
