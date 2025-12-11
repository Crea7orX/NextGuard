import z from "zod";

export const sendMessageToNodeRequestSchema = z.object({
  serialId: z.uuid(),
  nodeSerialId: z.uuid(),
  message: z.string(),
});

export type SendMessageToNodeRequest = z.infer<
  typeof sendMessageToNodeRequestSchema
>;

export const messageFromNodeSchema = z.object({
  serialId: z.uuid(),
  message: z.string(),
});

export type MessageFromNode = z.infer<typeof messageFromNodeSchema>;
