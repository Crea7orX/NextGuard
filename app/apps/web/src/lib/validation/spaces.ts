import { z } from "zod";

export const spaceCreateSchema = z.object({
  name: z.string().min(2).max(255),
  logo: z
    .file()
    .max(10_000_000)
    .mime(["image/png", "image/jpeg", "image/webp"])
    .optional(),
});

export type SpaceCreate = z.infer<typeof spaceCreateSchema>;

export function generateRandomSlug() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
