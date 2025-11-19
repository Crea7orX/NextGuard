import type { Response } from "express";
import { z } from "zod";
import { createErrorResponse } from "~/lib/responses";

export function handleError(response: Response, error: unknown) {
  if (error instanceof BadRequestError)
    return createErrorResponse(response, error.message, 400);

  if (error instanceof UnauthorizedError)
    return createErrorResponse(response, error.message, 401);

  if (error instanceof ForbiddenError)
    return createErrorResponse(response, error.message, 403);

  if (error instanceof NotFoundError)
    return createErrorResponse(response, error.message, 404);

  if (error instanceof ConflictError)
    return createErrorResponse(response, error.message, 409);

  // TODO: catching zod errors from return schema conversion
  if (error instanceof z.ZodError)
    return response.status(422).json(error.issues);

  console.error(`[CRITICAL]: ${error as string}`);
  return createErrorResponse(response, "Internal Server Error");
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
