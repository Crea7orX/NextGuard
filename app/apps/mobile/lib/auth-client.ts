import {
  lastLoginMethodClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { env } from "@/env";
import { ac, owner } from "@/lib/permissions";

export const authClient = createAuthClient({
  baseURL: env.EXPO_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    expoClient({
      scheme: "nextguardmobile",
      storagePrefix: "NG_AUTH_",
      storage: SecureStore,
    }),
    lastLoginMethodClient(),
    organizationClient({
      ac,
      roles: {
        owner,
      },
    }),
  ],
});
