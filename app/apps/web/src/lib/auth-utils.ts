import { APIError } from "better-auth";
import type { NextRequest } from "next/server";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { ForbiddenError, UnauthorizedError } from "~/lib/errors";
import { convertCommaSeparatedPermissions } from "~/lib/permissions";

export async function authenticateUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session) throw new UnauthorizedError();

    return {
      ...session,
      ownerId: session.session.activeOrganizationId ?? session.user.id,
    };
  } catch (error) {
    if (error instanceof APIError) {
      if (error.status === "UNAUTHORIZED") {
        throw new UnauthorizedError();
      }
    }

    throw error;
  }
}

export async function authenticateAndAuthorizeUser(
  request: NextRequest,
  permissions: string | string[],
) {
  const authResult = await authenticateUser(request);
  const hasPermission = await checkPermission(request, permissions);

  if (!hasPermission.success) throw new ForbiddenError();

  return authResult;
}

export async function checkPermission(
  request: NextRequest,
  permissions: string | string[],
) {
  const permissionsObject = convertCommaSeparatedPermissions(
    typeof permissions === "string" ? permissions : permissions.join(","),
  );

  return await auth.api.hasPermission({
    headers: request.headers,
    body: {
      permissions: permissionsObject,
    },
  });
}

export async function authenticateWSServer(request: NextRequest) {
  const token = request.headers.get("Authorization")?.split("Bearer ")?.[1];

  if (!token || token !== env.WEBSOCKET_SECRET_KEY) {
    throw new UnauthorizedError();
  }

  return true;
}
