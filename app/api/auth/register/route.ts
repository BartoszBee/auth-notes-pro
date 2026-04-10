import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import sql from "@/lib/db"

export async function POST(request: NextRequest) {
    const { email, password } = await request.json();

    const result = await sql`
      SELECT * FROM users 
      WHERE email = ${email}
    `

    console.log(result)

}