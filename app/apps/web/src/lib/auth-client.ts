import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { env } from "~/env";
import { ac, owner } from "~/lib/permissions";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    lastLoginMethodClient(),
    organizationClient({
      ac,
      roles: {
        owner,
      },
    }),
  ],
});
