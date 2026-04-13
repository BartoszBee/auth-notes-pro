"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/schemas";



export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validation = registerSchema.safeParse({ email, password });
    if (!validation.success) {
      setError("Podaj poprawny email i hasło minimum 8 znaków");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Nie udało się utworzyć konta");
        return;
      }

      router.replace("/");
    } catch {
      setError("Nie udało się utworzyć konta");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>{error}</div>}
      <div>
        <label>
          Email:
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />
        </label>
      </div>
      <div>
        <label>
          Password:
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </label>
      </div>
      <button type="submit">Zarejestruj się</button>
    </form>
  );
}
