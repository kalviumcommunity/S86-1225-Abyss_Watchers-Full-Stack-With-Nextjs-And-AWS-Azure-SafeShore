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

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment) return sendError("Not found", "NOT_FOUND", 404);
    return sendSuccess(appointment, "Appointment fetched");
  } catch (err) {
    console.error(err);
    return sendError(
      "Failed to fetch appointment",
      "DATABASE_FAILURE",
      500,
      err
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
      return sendError("Invalid id", "VALIDATION_ERROR", 400);

    const payload = await req.json();
    const { tokenNo, status } = payload;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { tokenNo, status },
    });
    return sendSuccess(appointment, "Appointment updated");
  } catch (err) {
    console.error(err);
    return sendError(
      "Failed to update appointment",
      "DATABASE_FAILURE",
      500,
      err
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
      return sendError("Invalid id", "VALIDATION_ERROR", 400);

    await prisma.appointment.delete({ where: { id } });
    return sendSuccess(null, "Deleted");
  } catch (err) {
    console.error(err);
    return sendError(
      "Failed to delete appointment",
      "DATABASE_FAILURE",
      500,
      err
    );
  }
}
