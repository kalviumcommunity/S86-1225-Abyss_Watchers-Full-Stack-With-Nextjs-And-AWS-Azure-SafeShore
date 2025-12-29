import { NextResponse } from "next/server";
import { appointmentSchema } from "@/lib/schemas/appointmentSchema";
import { sanitizeInput } from "@/lib/sanitize";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = appointmentSchema.parse(body);
    const sanitized = { ...data, notes: data.notes ? sanitizeInput(data.notes) : undefined };
    return NextResponse.json({ success: true, data: sanitized }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation Error",
          errors: error.errors.map((e) => ({ field: e.path[0], message: e.message })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, message: "Unexpected error" }, { status: 500 });
  }
}
