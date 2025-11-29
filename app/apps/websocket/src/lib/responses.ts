import type { Response } from "express";

export function createErrorResponse<T>(
  response: Response,
  error: T,
  status = 500,
) {
  return response.status(status).json({
    success: false,
    error,
  });
}

export type ErrorResponse<T> = {
  success: false;
  error: T;
};

export function createSuccessResponse<T>(
  response: Response,
  data: T,
  status = 200,
) {
  return response.status(status).json({
    success: true,
    data,
  });
}

export type SuccessResponse<T> = {
  success: true;
  data: T;
};
