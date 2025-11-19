import z from "zod";

export const adoptionRequestSchema = z.object({
  serialId: z.uuid(),
  nodeSerialId: z.uuid(),
});

export type AdoptionRequest = z.infer<typeof adoptionRequestSchema>;

export const nodeAdoptionSchema = z.object({
  serialId: z.uuid(),
  sharedSecret: z.string(),
});

export type NodeAdoption = z.infer<typeof nodeAdoptionSchema>;
