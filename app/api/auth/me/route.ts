import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const tokenFromHeader = authHeader?.split(" ")[1];
    const cookieHeader = req.headers.get("cookie") || "";

    const tokenFromCookie = cookieHeader.split("token=")[1]?.split(";")[0];
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    const decoded: any = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({ success: true, data: { id: decoded.id, email: decoded.email, role: decoded.role } }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 403 });
  }
}
