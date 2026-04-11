import * as jose from "jose";
import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const validation = loginSchema.safeParse({ email, password });

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;

    if (!result.length) {
      return NextResponse.json(
        { error: "Podany email lub hasło są nieprawidłowe" },
        { status: 401 },
      );
    }

    const passwordOk = await bcrypt.compare(password, result[0].password_hash);

    if (!passwordOk) {
      return NextResponse.json(
        { error: "Podany email lub hasło są nieprawidłowe" },
        { status: 401 },
      );
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new jose.SignJWT({
      id: result[0].id,
      email: result[0].email,
      role: result[0].role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json({
      id: result[0].id,
      email: result[0].email,
      role: result[0].role,
    });
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}
