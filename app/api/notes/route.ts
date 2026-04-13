import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { noteSchema } from "@/lib/schemas";
import sql from "@/lib/db";



export async function POST(request: NextRequest) {
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
    INSERT INTO notes (user_id, title, content)
    VALUES (${user.id}, ${note.data.title}, ${note.data.content ?? null})
    RETURNING id, title, content
  `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Nie udało się utworzyć notatki - spróbuj ponownie później" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { id: result[0].id, title: result[0].title, content: result[0].content },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Nie udało się utworzyć notatki - spróbuj ponownie później" },
      { status: 500 },
    );
  }
}

export async function GET() {
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
    ORDER BY created_at DESC
  `;
    } else {
      result = await sql`
    SELECT id, title, content, created_at FROM notes
    WHERE user_id = ${user.id}
    ORDER BY created_at DESC
  `;
    }


    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Błąd komunikacji z serwerem, spróbuj ponownie później" },
      { status: 500 },
    );
  }

}