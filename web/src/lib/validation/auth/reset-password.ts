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

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8),
    newPassword: z.string().min(8).max(128).superRefine(validatePassword),
    newPasswordConfirmation: z
      .string()
      .min(8)
      .max(128)
      .superRefine(validatePassword),
    revokeOtherSessions: z.boolean().optional(),
  })
  .refine(({ password, newPassword }) => password !== newPassword, {
    message: "Use a different password from the current one",
    path: ["newPassword"],
  })
  .refine(
    ({ newPassword, newPasswordConfirmation }) =>
      newPassword === newPasswordConfirmation,
    {
      message: "Passwords don't match",
      path: ["newPasswordConfirmation"],
    },
  );

export type UpdatePassword = z.infer<typeof updatePasswordSchema>;
