import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export type SignIn = z.infer<typeof signInSchema>;
