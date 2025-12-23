import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { handleError } from "@/lib/errorHandler";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ success: true, message: "Protected data", user: decoded }, { status: 200 });
  } catch (e) {
    return handleError(e, "GET /api/users", 403);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = userSchema.parse(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
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
    return handleError(error, "POST /api/users");
  }
}
