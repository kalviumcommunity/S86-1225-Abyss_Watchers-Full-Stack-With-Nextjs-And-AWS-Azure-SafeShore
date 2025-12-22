import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return sendError("Invalid id", "VALIDATION_ERROR", 400);

    const queue = await prisma.queue.findUnique({ where: { id } });
    if (!queue) return sendError("Not found", "NOT_FOUND", 404);
    return sendSuccess(queue, "Queue fetched");
  } catch (err) {
    console.error(err);
    return sendError("Failed to fetch queue", "DATABASE_FAILURE", 500, err);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return sendError("Invalid id", "VALIDATION_ERROR", 400);

    const payload = await req.json();
    const { currentNo, date, doctorId } = payload;

    const queue = await prisma.queue.update({
      where: { id },
      data: { currentNo, date: date ? new Date(date) : undefined, doctorId },
    });
    return sendSuccess(queue, "Queue updated");
  } catch (err) {
    console.error(err);
    return sendError("Failed to update queue", "DATABASE_FAILURE", 500, err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id))
      return sendError("Invalid id", "VALIDATION_ERROR", 400);

    await prisma.queue.delete({ where: { id } });
    return sendSuccess(null, "Deleted");
  } catch (err) {
    console.error(err);
    return sendError("Failed to delete queue", "DATABASE_FAILURE", 500, err);
  }
}
