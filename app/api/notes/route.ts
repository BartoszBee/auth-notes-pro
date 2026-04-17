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

  const { title, content, tags } = await request.json();

  const note = noteSchema.safeParse({ title, content, tags });

  if (!note.success) {
    return NextResponse.json({ error: note.error.issues }, { status: 400 });
  }

  try {

    const result = await sql.begin(async (sql) => {

      const insertedNote = await sql`
    INSERT INTO notes (user_id, title, content)
    VALUES (${user.id}, ${note.data.title}, ${note.data.content ?? null})
    RETURNING id, title, content
  `;

      if (note.data.tags && note.data.tags.length > 0) {
        const insertedTags = await sql`
          INSERT INTO tags (name)
          SELECT UNNEST(${note.data.tags}::text[])
          ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
          RETURNING id
        `;


        await sql`
        INSERT INTO note_tags (note_id, tag_id)
        SELECT ${insertedNote[0].id}, id FROM tags WHERE name = ANY(${note.data.tags}::text[])
          `;

      }

      return insertedNote;
    })


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

export async function GET(request: NextRequest) {

  const search = request.nextUrl.searchParams.get("search");
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
    SELECT
    notes.id,
    notes.title,
    notes.content,
    notes.created_at,
    array_agg(tags.name) FILTER (WHERE tags.name IS NOT NULL) AS tags
    FROM notes
    LEFT JOIN note_tags ON notes.id = note_tags.note_id
    LEFT JOIN tags      ON note_tags.tag_id = tags.id
    WHERE notes.title ILIKE ${'%' + (search ?? '') + '%'}
    GROUP BY notes.id
  `;
    } else {
      result = await sql`
    SELECT
    notes.id,
    notes.title,
    notes.content,
    notes.created_at,
    array_agg(tags.name) FILTER (WHERE tags.name IS NOT NULL) AS tags
    FROM notes
    LEFT JOIN note_tags ON notes.id = note_tags.note_id
    LEFT JOIN tags      ON note_tags.tag_id = tags.id
    WHERE notes.user_id = ${user.id} AND notes.title ILIKE ${'%' + (search ?? '') + '%'}
    GROUP BY notes.id
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