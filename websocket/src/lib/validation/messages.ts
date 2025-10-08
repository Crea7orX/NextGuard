import z from "zod";

export const baseMessageSchema = z.object({
  type: z.string(),
  seq: z.number(),
  ts: z.number(), // timestamp
  nonce: z.string().length(16),
  mac: z.string(),
});

export type BaseMessage = z.infer<typeof baseMessageSchema>;

export const helloMessageSchema = z.object({
  type: z.literal("hello"),
  device_id: z.string(),
  ts: z.number(), // timestamp
  nonce: z.string().length(16),
  sig: z.string(), // signature
  pubkey_pem: z.string().refine(
    (key) => {
      return (
        key.includes("-----BEGIN PUBLIC KEY-----") &&
        key.includes("-----END PUBLIC KEY-----")
      );
    },
    {
      message: "Public key must be in valid PEM format",
    },
  ),
});

export type HelloMessage = z.infer<typeof helloMessageSchema>;

export const sessionMessageSchema = z.object({
  type: z.literal("session"),
  device_id: z.string(),
  ts: z.number(), // timestamp
  nonce: z.string().length(16),
  sig: z.string(), // signature
});

export type SessionMessage = z.infer<typeof sessionMessageSchema>;
