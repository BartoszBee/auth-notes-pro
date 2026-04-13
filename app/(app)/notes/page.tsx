"use client";
import type { Note } from "@/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export default function Notes() {
  const { data, isLoading, isError } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: () => fetch("/api/notes").then((res) => res.json()),
  });
  

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <h1>Lista notatek: </h1>
      {data && data.length > 0 ? (
        <ul>
          {data.map((note) => (
            <li key={note.id}>
              <h2>{note.title}</h2>
              {note.content && <p>{note.content}</p>}
              <p>{note.created_at}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Brak notatek</p>
      )}

      <Link href="/notes/new">Utwórz notatkę</Link>
    </>
  );
}
