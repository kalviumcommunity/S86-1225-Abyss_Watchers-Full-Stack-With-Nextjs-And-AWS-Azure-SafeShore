import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleError(error: any, context = "", status = 500) {
  const isProd = process.env.NODE_ENV === "production";

  const message = isProd ? "Something went wrong. Please try again later." : (error?.message || "Unknown error");
  const payload: any = { success: false, message };
  if (!isProd && error?.stack) payload.stack = error.stack;

  try {
    logger.error(`Error in ${context}`, { message: error?.message, stack: isProd ? "REDACTED" : error?.stack });
  } catch (e) {
    console.error("Failed to log error", e);
  }

  return NextResponse.json(payload, { status });
}
