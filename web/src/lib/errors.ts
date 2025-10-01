import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createErrorResponse } from "~/lib/responses";

export function handleError(error: unknown) {
  if (error instanceof BadRequestError)
    return createErrorResponse(error.message, 400);

  if (error instanceof UnauthorizedError)
    return createErrorResponse(error.message, 401);

  if (error instanceof ForbiddenError)
    return createErrorResponse(error.message, 403);

  if (error instanceof NotFoundError)
    return createErrorResponse(error.message, 404);

  if (error instanceof ConflictError)
    return createErrorResponse(error.message, 409);

  // TODO: catching zod errors from return schema conversion
  if (error instanceof z.ZodError)
    return NextResponse.json(error.issues, { status: 422 });

  console.error(`[CRITICAL]: ${error as string}`);
  return createErrorResponse("Internal Server Error");
}

export class BadRequestError extends Error {
  constructor(message = "Bad Request") {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not Found") {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message = "Conflict") {
    super(message);
  }
}
