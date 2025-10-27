import { NextResponse } from "next/server";

export function createErrorResponse<T>(error: T, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    {
      status,
    },
  );
}

export type ErrorResponse<T> = {
  success: false;
  error: T;
};

export function createSuccessResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
    },
  );
}

export type SuccessResponse<T> = {
  success: true;
  data: T;
};
