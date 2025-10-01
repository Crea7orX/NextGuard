import { NextResponse } from "next/server";

export function createErrorResponse(error: unknown, status = 500) {
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

export function createSuccessResponse(data: unknown, status = 200) {
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
