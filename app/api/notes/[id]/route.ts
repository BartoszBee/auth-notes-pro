import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import sql from "@/lib/db";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await getUserFromRequest();
    if (!user) {
        return NextResponse.json(
            { error: "Użytkownik niezalogowany" },
            { status: 401 },
        );
    }

    try {
        const result = await sql`
    DELETE FROM notes
    WHERE user_id = ${user.id} AND id=${id} 
    `

        if (!result.count) {
            return NextResponse.json(
                { error: "Notatka o takim id nie istnieje w bazie" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            null,
            { status: 204 },
        );

    } catch {
        return NextResponse.json(
            { error: "Wystąpił błąd podczas usuwania notatki. Spróbuj ponownie później" },
            { status: 500 })
    }
}