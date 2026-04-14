"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { noteSchema } from "@/lib/schemas";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export default function NewNote() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { title: string; content?: string }) =>
      fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Nie udało się utworzyć notatki");
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
        {!mutation.isPending ? "Dodaj notatkę" : "Wysyłanie..."}
      </button>
    </form>
  );
}
