import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jose.jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const pathname = request.nextUrl.pathname;
  const isPublic = ["/login", "/register"].some((p) => pathname.startsWith(p));
  const isValid = token ? await verifyToken(token) : false;

  if (isPublic) {
    return isValid
      ? NextResponse.redirect(new URL("/notes", request.url))
      : NextResponse.next();
  }

  return isValid
    ? NextResponse.next()
    : NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/notes/:path*", "/login", "/register"],
};
