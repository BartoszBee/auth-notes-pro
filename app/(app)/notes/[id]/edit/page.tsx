"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { noteSchema } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import type { Note } from "@/types";

export default function EditNote() {
  const { id } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => fetch(`/api/notes/${id}`).then((res) => res.json()),
  });

  if (isLoading) return <div>Ładowanie notatki...</div>;
  if (isError) return <div>Błąd pobierania notatki...</div>;
  return <EditForm note={data} id={id as string} />;
}

function EditForm({
  note,
  id,
}: {
  note: Omit<Note, "created_at">;
  id: string;
}) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content ?? "");
  const [error, setError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { title: string; content?: string }) =>
      fetch(`/api/notes/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Nie udało się zedytować notatki");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      router.push("/notes");
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = noteSchema.safeParse({ title, content });
    if (!validation.success) {
      setError("Tytuł musi zawierać co najmnie 3 znaki");
      return;
    }

    mutation.mutate(validation.data);
  };
  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <div>
        <label>
          Tytuł:
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            type="text"
          />
        </label>
      </div>
      <div>
        <label>
          Treść:
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </label>
      </div>
      <button disabled={mutation.isPending} type="submit">
        {!mutation.isPending ? "Zapisz edycję" : "Zapisywanie..."}
      </button>
    </form>
  );
}
