import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sql from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const result = await sql`
      SELECT * FROM users
      WHERE email = ${email}
    `;

    if (result.length > 0) {
      return NextResponse.json(
        { error: "Podany email już istnieje - zaloguj się" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await sql`
      INSERT INTO users (email, password_hash) VALUES (${email},${hashedPassword}) RETURNING id,email      
    `;

    return NextResponse.json(newUser[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Wewnętrzny błąd serwera" },
      { status: 500 },
    );
  }
}
