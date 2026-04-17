import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import sql from "@/lib/db";


export async function GET() {

    const user = await getUserFromRequest();
    if (!user) {
        return NextResponse.json(
            { error: "Użytkownik niezalogowany" },
            { status: 401 },
        );
    }

    try {

        const result = await sql`
    SELECT name from tags ORDER BY name   
  `;


        return NextResponse.json(result);
    } catch {
        return NextResponse.json(
            { error: "Błąd komunikacji z serwerem, spróbuj ponownie później" },
            { status: 500 },
        );
    }

}