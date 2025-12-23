import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { handleError } from "@/lib/errorHandler";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    jwt.verify(token, JWT_SECRET);

    const cacheKey = "users:list";
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: JSON.parse(cached), source: "cache" }, { status: 200 });
    }

    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });

    await redis.set(cacheKey, JSON.stringify(users), "EX", 60);

    return NextResponse.json({ success: true, data: users, source: "db" }, { status: 200 });
  } catch (e) {
    return handleError(e, "GET /api/users", 403);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = userSchema.parse(body);

    const created = await prisma.user.create({ data });

    // Invalidate users list cache
    await redis.del("users:list");

    return NextResponse.json({ success: true, data: created }, { status: 201 });
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
