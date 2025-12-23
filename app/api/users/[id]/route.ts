import { NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { handleError } from "@/lib/errorHandler";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const partial = userSchema.partial();
    const data = partial.parse(body);

    const updated = await prisma.user.update({ where: { id: Number(params.id) }, data });

    // invalidate cache
    try {
      await redis.del("users:list");
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
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
    return handleError(error, `PUT /api/users/${params.id}`);
  }
}
