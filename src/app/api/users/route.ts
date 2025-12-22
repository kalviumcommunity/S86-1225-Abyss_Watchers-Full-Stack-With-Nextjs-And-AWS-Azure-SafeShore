import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.user.findMany({ skip, take: limit, orderBy: { id: "asc" } }),
      prisma.user.count(),
    ]);

    return sendSuccess(
      { page, limit, total, items: data },
      "Users fetched successfully",
      200
    );
  } catch (err) {
    console.error(err);
    return sendError("Failed to fetch users", "DATABASE_FAILURE", 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { name, email, role } = payload;
    if (!name || !email) {
      return sendError("name and email are required", "VALIDATION_ERROR", 400);
    }

    const user = await prisma.user.create({ data: { name, email, role } });
    return sendSuccess(user, "User created", 201);
  } catch (err: unknown) {
    console.error(err);
    return sendError("Failed to create user", "DATABASE_FAILURE", 500, err);
  }
}
