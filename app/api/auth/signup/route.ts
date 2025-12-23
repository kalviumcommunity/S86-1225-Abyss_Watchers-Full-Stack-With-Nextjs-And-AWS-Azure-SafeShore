import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword } });

    return NextResponse.json({ success: true, message: "Signup successful", user: { id: newUser.id, email: newUser.email, name: newUser.name } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Signup failed", error: String(error) }, { status: 500 });
  }
}
