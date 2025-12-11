import type { NextRequest } from "next/server";
import { authenticateAndAuthorizeUser } from "~/lib/auth-utils";
import { handleError } from "~/lib/errors";
import { createSuccessResponse } from "~/lib/responses";
import { armOrganizationById } from "~/server/db/queries/organizations";

interface Props {
  params: Promise<{ id: string }>;
}

// Arm active space
export async function POST(request: NextRequest, { params }: Props) {
  try {
    // TODO: Check permissions
    const authResult = await authenticateAndAuthorizeUser(
      request,
      "pending_devices:read",
    );

    const { id } = await params;

    await armOrganizationById({
      id,
      userId: authResult.user.id,
    });
    return createSuccessResponse({});
  } catch (error) {
    return handleError(error);
  }
}
