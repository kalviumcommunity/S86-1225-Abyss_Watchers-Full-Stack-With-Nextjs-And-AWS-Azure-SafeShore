import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

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

    return sendSuccess(
      { page, limit, total, items: data },
      "Queues fetched",
      200
    );
  } catch (err) {
    console.error(err);
    return sendError("Failed to fetch queues", "DATABASE_FAILURE", 500, err);
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { doctorId, date } = payload;
    if (!doctorId || !date)
      return sendError("doctorId and date required", "VALIDATION_ERROR", 400);

    const queue = await prisma.queue.create({
      data: { doctorId, date: new Date(date) },
    });
    return sendSuccess(queue, "Queue created", 201);
  } catch (err) {
    console.error(err);
    return sendError("Failed to create queue", "DATABASE_FAILURE", 500, err);
  }
}
