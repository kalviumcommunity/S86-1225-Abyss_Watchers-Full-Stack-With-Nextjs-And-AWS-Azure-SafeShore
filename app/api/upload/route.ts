import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { handleError } from "@/lib/errorHandler";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function POST(req: Request) {
  try {
    const { filename, fileType } = await req.json();

    if (!filename || !fileType) return NextResponse.json({ success: false, message: "filename and fileType required" }, { status: 400 });

    // Basic validation
    if (!fileType.startsWith("image/") && !fileType.startsWith("application/pdf")) {
      return NextResponse.json({ success: false, message: "Unsupported file type" }, { status: 400 });
    }

    const key = `${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 120 }); // 120s

    return NextResponse.json({ success: true, uploadURL: url, key }, { status: 200 });
  } catch (error) {
    return handleError(error, "POST /api/upload");
  }
}
