import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin and users API routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);

      // Admin-only access for /api/admin
      if (pathname.startsWith("/api/admin") && decoded.role !== "admin") {
        return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
      }

      // Attach user info to headers for downstream handlers
      const requestHeaders = new Headers(req.headers);
      if (decoded.email) requestHeaders.set("x-user-email", decoded.email);
      if (decoded.role) requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (e) {
      return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/api/users/:path*"],
};
