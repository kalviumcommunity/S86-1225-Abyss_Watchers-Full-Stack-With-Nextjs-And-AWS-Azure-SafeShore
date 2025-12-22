import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.appointment.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.appointment.count(),
    ]);

    return NextResponse.json({ page, limit, total, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { tokenNo, userId, queueId, status } = payload;
    if (typeof tokenNo !== "number" || !userId || !queueId)
      return NextResponse.json(
        { error: "tokenNo, userId and queueId are required" },
        { status: 400 }
      );

    const appointment = await prisma.appointment.create({
      data: { tokenNo, userId, queueId, status },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}
