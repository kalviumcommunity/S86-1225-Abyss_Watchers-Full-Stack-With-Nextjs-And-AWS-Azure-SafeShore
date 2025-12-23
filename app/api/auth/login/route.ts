import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) return NextResponse.json({ success: false, message: "Missing credentials" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

    return NextResponse.json({ success: true, message: "Login successful", token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Login failed", error: String(error) }, { status: 500 });
  }
}
