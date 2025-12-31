import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Enforce HTTPS when behind proxies/load balancers that set x-forwarded-proto
  const forwardedProto = req.headers.get("x-forwarded-proto") || req.headers.get("x-forwarded-protocol");
  const arrSsl = req.headers.get("x-arr-ssl");
  const isHttp = forwardedProto === "http" || (!forwardedProto && !arrSsl && req.nextUrl.protocol === "http:");
  if (isHttp) {
    const url = new URL(req.url);
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  const setSecurityHeaders = (res: NextResponse, isApi = false) => {
    const HSTS = "max-age=63072000; includeSubDomains; preload";
    const CSP = "default-src 'self'; img-src 'self' data:; script-src 'self' https:; style-src 'self' 'unsafe-inline';";
    const allowedOrigin = process.env.ALLOWED_ORIGIN || "http://localhost:3000";

    res.headers.set("Strict-Transport-Security", HSTS);
    res.headers.set("Content-Security-Policy", CSP);
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("Referrer-Policy", "no-referrer");
    res.headers.set("Permissions-Policy", "geolocation=()");

    if (isApi) {
      res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    return res;
  };

  // Protect admin and users API routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      const res = NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });
      return setSecurityHeaders(res, true);
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

      const res = NextResponse.next({ request: { headers: requestHeaders } });
      return setSecurityHeaders(res, true);
    } catch (e) {
      const res = NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 403 });
      return setSecurityHeaders(res, true);
    }
  }

  // Protect page routes: /dashboard and /users (cookie-based JWT)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/users")) {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      const loginUrl = new URL("/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      return setSecurityHeaders(res, false);
    }

    try {
      jwt.verify(token, JWT_SECRET);
      const res = NextResponse.next();
      return setSecurityHeaders(res, false);
    } catch (e) {
      const loginUrl = new URL("/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      return setSecurityHeaders(res, false);
    }
  }

  const res = NextResponse.next();
  return setSecurityHeaders(res, false);
}

export const config = {
  matcher: ["/:path*"],
};
