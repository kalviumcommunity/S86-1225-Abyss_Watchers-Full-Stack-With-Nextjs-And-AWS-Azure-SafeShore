import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const { fileName, fileURL, size, uploaderId } = await req.json();

    // Note: ensure you have a `File` model in your Prisma schema
    const record = await prisma.file.create({
      data: {
        name: fileName,
        url: fileURL,
        size: size ?? null,
        uploadedById: uploaderId ?? null,
      },
    });

    return NextResponse.json({ success: true, file: record }, { status: 201 });
  } catch (error) {
    return handleError(error, "POST /api/files");
  }
}
