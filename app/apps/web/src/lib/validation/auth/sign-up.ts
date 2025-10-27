import { type RefinementCtx, z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128).superRefine(validatePassword),
    passwordConfirmation: z
      .string()
      .min(8)
      .max(128)
      .superRefine(validatePassword),
    firstName: z.string().min(2).max(128),
    lastName: z.string().min(2).max(127),
  })
  .refine(
    ({ password, passwordConfirmation }) => password === passwordConfirmation,
    {
      message: "Passwords don't match",
      path: ["passwordConfirmation"],
    },
  );

export type SignUp = z.infer<typeof signUpSchema>;

export function validatePassword(val: string, ctx: RefinementCtx) {
  const smallLetter = /[a-z]/.test(val);
  if (!smallLetter)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one small letter",
    });
  const capitalLetter = /[A-Z]/.test(val);
  if (!capitalLetter)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one capital letter",
    });
  const number = /[0-9]/.test(val);
  if (!number)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one number",
    });
  const specialCharacter = /[^a-zA-Z0-9]/.test(val);
  if (!specialCharacter)
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must contain at least one special character",
    });
}
