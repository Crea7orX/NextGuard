import z from "zod";

export const hubResponseSchema = z.object({
  id: z.string(),
  serialId: z.uuid(),
  name: z.string(),
  description: z.string().optional(),
  ownerId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number().optional(),
});

export type HubResponse = z.infer<typeof hubResponseSchema>;
