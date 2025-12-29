import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import jwt from "jsonwebtoken";
import { hasPermission, logDecision } from "@/lib/rbac";
import { handleError } from "@/lib/errorHandler";
import { prisma } from "@/lib/prisma";
import { sanitizeObjectStrings } from "@/lib/sanitize";
import redis from "@/lib/redis";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Permission check: list users requires 'read'
    const allowed = hasPermission(decoded.role, "read");
    logDecision(decoded.role, "users", "read", allowed);
    if (!allowed) return NextResponse.json({ success: false, message: "Access denied: insufficient permissions." }, { status: 403 });

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

    // Verify token and permissions for creation
    const authHeader = req.headers.get("authorization");
    const token2 = authHeader?.split(" ")[1];
    if (!token2) return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    const decoded2: any = jwt.verify(token2, JWT_SECRET);
    const createAllowed = hasPermission(decoded2.role, "create");
    logDecision(decoded2.role, "users", "create", createAllowed);
    if (!createAllowed) return NextResponse.json({ success: false, message: "Access denied: insufficient permissions." }, { status: 403 });

    const sanitizedData = sanitizeObjectStrings(data);
    const created = await prisma.user.create({ data: sanitizedData });

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
