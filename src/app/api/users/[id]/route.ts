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

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return sendError("Not found", "NOT_FOUND", 404);
    return sendSuccess(user, "User fetched successfully");
  } catch (err) {
    console.error(err);
    return sendError("Failed to fetch user", "DATABASE_FAILURE", 500, err);
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
    const { name, email, role } = payload;

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role },
    });
    return sendSuccess(user, "User updated successfully");
  } catch (err: unknown) {
    console.error(err);
    return sendError("Failed to update user", "DATABASE_FAILURE", 500, err);
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

    await prisma.user.delete({ where: { id } });
    return sendSuccess(null, "Deleted");
  } catch (err) {
    console.error(err);
    return sendError("Failed to delete user", "DATABASE_FAILURE", 500, err);
  }
}
