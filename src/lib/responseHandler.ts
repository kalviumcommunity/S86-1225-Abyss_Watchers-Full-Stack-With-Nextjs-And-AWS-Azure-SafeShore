import { NextResponse } from "next/server";
import { ERROR_CODES } from "./errorCodes";

type ApiError = {
  code: string;
  details?: unknown;
};

type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T | null;
  error?: ApiError | null;
  timestamp: string;
};

export const sendSuccess = <T = unknown>(
  data: T | null = null,
  message = "Success",
  status = 200
) => {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status });
};

export const sendError = (
  message = "Something went wrong",
  code: keyof typeof ERROR_CODES = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) => {
  const codeValue =
    (ERROR_CODES as Record<string, string>)[code as string] || (code as string);
  const payload: ApiResponse<null> = {
    success: false,
    message,
    error: { code: codeValue, details },
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status });
};
