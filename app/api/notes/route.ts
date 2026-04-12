import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { z } from "zod";
import sql from "@/lib/db";

const noteSchema = z.object({
  title: z.string().min(3),
  content: z.string().optional(),
});

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
}
