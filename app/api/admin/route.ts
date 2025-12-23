import { NextResponse } from "next/server";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    return NextResponse.json({ success: true, message: "Welcome Admin! You have full access." }, { status: 200 });
  } catch (error) {
    return handleError(error, "GET /api/admin");
  }
}
