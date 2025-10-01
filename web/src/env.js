import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.url(),
    SERVER_SECRET_KEY: z.string(),
    WEBSOCKET_SERVER: z.url().default("http://localhost:3000"),
    WEBSOCKET_SECRET_KEY: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    BETTER_AUTH_EMAIL_VERIFICATION_EXPIRES_IN: z.coerce.number().default(600),
    BETTER_AUTH_RESET_PASSWORD_EXPIRES_IN: z.coerce.number().default(300),
    BETTER_AUTH_ORGANIZATION_LIMIT: z.coerce.number().default(5),
    GOOGLE_CLIENT_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_BASE_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_API_BASE_URL: z.url().default("http://localhost:3000/api"),
    NEXT_PUBLIC_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    SERVER_SECRET_KEY: process.env.SERVER_SECRET_KEY,
    WEBSOCKET_SERVER: process.env.WEBSOCKET_SERVER,
    WEBSOCKET_SECRET_KEY: process.env.WEBSOCKET_SECRET_KEY,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_EMAIL_VERIFICATION_EXPIRES_IN:
      process.env.BETTER_AUTH_EMAIL_VERIFICATION_EXPIRES_IN,
    BETTER_AUTH_RESET_PASSWORD_EXPIRES_IN:
      process.env.BETTER_AUTH_RESET_PASSWORD_EXPIRES_IN,
    BETTER_AUTH_ORGANIZATION_LIMIT: process.env.BETTER_AUTH_ORGANIZATION_LIMIT,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
