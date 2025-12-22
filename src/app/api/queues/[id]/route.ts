import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const queue = await prisma.queue.findUnique({ where: { id } });
    if (!queue)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(queue);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch queue" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const payload = await req.json();
    const { currentNo, date, doctorId } = payload;

    const queue = await prisma.queue.update({
      where: { id },
      data: { currentNo, date: date ? new Date(date) : undefined, doctorId },
    });
    return NextResponse.json(queue);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update queue" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await prisma.queue.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete queue" },
      { status: 500 }
    );
  }
}
