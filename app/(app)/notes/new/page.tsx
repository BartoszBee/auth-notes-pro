"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { noteSchema } from "@/lib/schemas";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

export default function NewNote() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const { data } = useQuery<{ id: number; name: string }[]>({
    queryKey: ["tags"],
    queryFn: () => fetch("/api/tags").then((res) => res.json()),
  });

  const mutation = useMutation({
    mutationFn: (data: { title: string; content?: string; tags?: string[] }) =>
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
    const validation = noteSchema.safeParse({
      title,
      content,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
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
      <div>
        <label>
          Tagi:
          <input
            type="text"
            list="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </label>
        {data && data.length > 0 && (
          <datalist id="tags">
            {data.map((tag) => (
              <option key={tag.id} value={tag.name} />
            ))}
          </datalist>
        )}
      </div>
      <button disabled={mutation.isPending} type="submit">
        {!mutation.isPending ? "Dodaj notatkę" : "Wysyłanie..."}
      </button>
    </form>
  );
}
