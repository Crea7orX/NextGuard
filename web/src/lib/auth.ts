import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod } from "better-auth/plugins";
import { env } from "~/env";
import { db } from "~/server/db";
import { sendResetPasswordEmail } from "~/server/email/utils/send-password-reset-email";
import { sendVerificationEmail } from "~/server/email/utils/send-verification-email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: sendResetPasswordEmail,
    resetPasswordTokenExpiresIn: env.BETTER_AUTH_RESET_PASSWORD_EXPIRES_IN,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: sendVerificationEmail,
  },
  socialProviders: {
    google: {
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [lastLoginMethod()],
});
