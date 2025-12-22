import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Math.min(Number(url.searchParams.get("limit")) || 10, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.queue.findMany({ skip, take: limit, orderBy: { id: "asc" } }),
      prisma.queue.count(),
    ]);

    return NextResponse.json({ page, limit, total, data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch queues" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { doctorId, date } = payload;
    if (!doctorId || !date)
      return NextResponse.json(
        { error: "doctorId and date required" },
        { status: 400 }
      );

    const queue = await prisma.queue.create({
      data: { doctorId, date: new Date(date) },
    });
    return NextResponse.json(queue, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create queue" },
      { status: 500 }
    );
  }
}
