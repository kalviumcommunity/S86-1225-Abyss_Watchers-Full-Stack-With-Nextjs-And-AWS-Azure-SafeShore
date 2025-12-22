import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";

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

    return sendSuccess(
      { page, limit, total, items: data },
      "Appointments fetched",
      200
    );
  } catch (err) {
    console.error(err);
    return sendError(
      "Failed to fetch appointments",
      "DATABASE_FAILURE",
      500,
      err
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { tokenNo, userId, queueId, status } = payload;
    if (typeof tokenNo !== "number" || !userId || !queueId)
      return sendError(
        "tokenNo, userId and queueId are required",
        "VALIDATION_ERROR",
        400
      );

    const appointment = await prisma.appointment.create({
      data: { tokenNo, userId, queueId, status },
    });
    return sendSuccess(appointment, "Appointment created", 201);
  } catch (err: unknown) {
    console.error(err);
    return sendError(
      "Failed to create appointment",
      "DATABASE_FAILURE",
      500,
      err
    );
  }
}
