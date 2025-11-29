import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {},

  clientPrefix: "EXPO_PUBLIC_",

  client: {
    EXPO_PUBLIC_API_BASE_URL: z.url().default("http://localhost:3000/api"),
    EXPO_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
  },

  runtimeEnv: {
    EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    EXPO_PUBLIC_BETTER_AUTH_URL: process.env.EXPO_PUBLIC_BETTER_AUTH_URL,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
