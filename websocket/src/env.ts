import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    PORT: z.coerce.number().default(3000),
    SERVER_SECRET_KEY: z.string(),
    API_SERVER: z.string().default("http://localhost:3000"),
    API_SECRET_KEY: z.string(),
    SERVER_SIGN_KEY_PEM: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
