import z from "zod";

export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(128),
  lastName: z.string().min(2).max(127),
  image: z
    .file()
    .max(10_000_000)
    .mime(["image/png", "image/jpeg", "image/webp"])
    .optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;
