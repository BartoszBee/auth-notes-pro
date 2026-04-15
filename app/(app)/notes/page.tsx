"use client";
import type { Note } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Notes() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery<Note[]>({
    queryKey: ["notes", debouncedSearch],
    queryFn: () =>
      fetch(
        `/api/notes${debouncedSearch ? `?search=${debouncedSearch}` : ""}`,
      ).then((res) => res.json()),
  });

  const mutation = useMutation<Response, Error, number>({
    mutationFn: (id) => fetch(`/api/notes/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  return (
    <>
      <h1>Lista notatek: </h1>
      <p>
        Wyszukiwanie:{" "}
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </p>
      {data && data.length > 0 ? (
        <ul>
          {data.map((note) => (
            <li key={note.id}>
              <h2>{note.title}</h2>
              {note.content && <p>{note.content}</p>}
              <p>{note.created_at}</p>
              <div>
                <Link href={`/notes/${note.id}/edit`}>Edytuj</Link>
                <button onClick={() => mutation.mutate(note.id)}>Usuń</button>
              </div>
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
