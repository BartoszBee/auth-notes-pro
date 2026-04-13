import { z } from "zod";

export const noteSchema = z.object({
    title: z.string().min(3),
    content: z.string().optional(),
});

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});