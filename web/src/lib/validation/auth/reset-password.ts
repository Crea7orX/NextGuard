import { z } from "zod";
import { validatePassword } from "~/lib/validation/auth/sign-up";

export const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8).max(128).superRefine(validatePassword),
    passwordConfirmation: z
      .string()
      .min(8)
      .max(128)
      .superRefine(validatePassword),
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    },
  );

export type ResetPassword = z.infer<typeof resetPasswordSchema>;
