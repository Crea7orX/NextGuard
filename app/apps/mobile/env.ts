import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {},

  clientPrefix: "PUBLIC_",

  client: {
    PUBLIC_API_BASE_URL: z.url().default("http://localhost:3000/api"),
    PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  },

  runtimeEnv: {
    PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL,
    PUBLIC_BETTER_AUTH_URL: process.env.PUBLIC_BETTER_AUTH_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
