import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import sql from "@/lib/db";
import { noteSchema } from "@/lib/schemas";

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await getUserFromRequest();
    if (!user) {
        return NextResponse.json(
            { error: "Użytkownik niezalogowany" },
            { status: 401 },
        );
    }

    const { title, content } = await request.json();

    const note = noteSchema.safeParse({ title, content });

    if (!note.success) {
        return NextResponse.json({ error: note.error.issues }, { status: 400 });
    }

    try {

        const result = await sql`
        UPDATE notes 
        SET title = ${note.data.title}, content = ${note.data.content ?? null}
        WHERE user_id = ${user.id} AND id=${id} 
        RETURNING id, title, content
        `
        if (!result.count) {
            return NextResponse.json(
                { error: "Notatka o takim id nie istnieje w bazie" },
                { status: 404 },
            );
        }
        return NextResponse.json(
            result
        );



    } catch {
        return NextResponse.json(
            { error: "Wystąpił błąd podczas edycji notatki. Spróbuj ponownie później" },
            { status: 500 })
    }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await getUserFromRequest();
    if (!user) {
        return NextResponse.json(
            { error: "Użytkownik niezalogowany" },
            { status: 401 },
        );
    }

    try {

        let result = null;
        if (user.role === "admin") {
            result = await sql`
            SELECT id, title, content, created_at FROM notes 
            WHERE id = ${id}            
        `;
        } else {
            result = await sql`
            SELECT id, title, content, created_at FROM notes 
            WHERE id = ${id} and user_id = ${user.id}            
        `;
        }


        if (result.length === 0) {
            return NextResponse.json(
                { error: "Notatka o takim id nie istnieje w bazie" },
                { status: 404 },
            );
        }
        return NextResponse.json(
            result[0]
        );



    } catch {
        return NextResponse.json(
            { error: "Wystąpił błąd podczas pobierania notatki. Spróbuj ponownie później" },
            { status: 500 })
    }
}