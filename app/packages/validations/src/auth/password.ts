import { z, type RefinementCtx } from "zod";

export const resetPasswordRequestSchema = z.object({
  email: z.email(),
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

export function validatePassword(val: string, ctx: RefinementCtx) {
  const smallLetter = /[a-z]/.test(val);
  if (!smallLetter)
    ctx.addIssue({
      code: "custom",
      message: "Password must contain at least one small letter",
    });
  const capitalLetter = /[A-Z]/.test(val);
  if (!capitalLetter)
    ctx.addIssue({
      code: "custom",
      message: "Password must contain at least one capital letter",
    });
  const number = /[0-9]/.test(val);
  if (!number)
    ctx.addIssue({
      code: "custom",
      message: "Password must contain at least one number",
    });
  const specialCharacter = /[^a-zA-Z0-9]/.test(val);
  if (!specialCharacter)
    ctx.addIssue({
      code: "custom",
      message: "Password must contain at least one special character",
    });
}
