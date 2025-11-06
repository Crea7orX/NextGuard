import { z } from "zod";
import { validatePassword } from "./password";

export const signUpSchema = z
  .object({
    email: z.email(),
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
