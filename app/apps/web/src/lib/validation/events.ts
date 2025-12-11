import z from "zod";

export const eventResponseSchema = z.object({
  id: z.string(),
  action: z.string(),
  actorName: z.string().nullish(),
  actorId: z.string(),
  objectId: z.string().nullish(),
  title: z.string(),
  description: z.string(),
  reference: z.object().nullish(),
  ownerId: z.string(),
  createdAt: z.number(),
});

export type EventResponse = z.infer<typeof eventResponseSchema>;
