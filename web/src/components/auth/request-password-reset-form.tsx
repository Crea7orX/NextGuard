"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { ContinueWithPasswordButton } from "~/components/auth/continue-with-password-button";
import { ErrorAlert } from "~/components/auth/error-alert";
import { SuccessAlert } from "~/components/auth/success-alert";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { env } from "~/env";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import {
  resetPasswordRequestSchema,
  type ResetPasswordRequest,
} from "~/lib/validation/auth/reset-password";

export function RequestPasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/dashboard",
    [searchParams],
  );
  const lastMethod = authClient.getLastUsedLoginMethod();

  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordRequestSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
    },
    disabled: isLoading || isLoadingProvider,
  });

  const redirectSearchParams = React.useMemo(() => {
    const email = form.watch("email");
    const params = new URLSearchParams(searchParams.toString());
    if (email) {
      params.set("email", email);
    } else {
      params.delete("email");
    }
    params.delete("token");
    params.delete("error");
    return params.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, form.getValues("email")]);

  function onSubmit(data: ResetPasswordRequest) {
    void authClient.requestPasswordReset(
      {
        ...data,
        redirectTo: `${env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/token?${redirectSearchParams}`,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setSuccess(null);
          setError(null);
        },
        onSuccess: () => {
          setIsLoading(false);
          setSuccess(
            "If the email address you entered is valid, you will receive an email with a link to reset your password.",
          );
          form.reset({ email: "" });
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message);
        },
      },
    );
  }

  return (
    <Form {...form}>
      <div className={cn("grid gap-6", className)} {...props}>
        {success && <SuccessAlert success={success} />}
        {error && <ErrorAlert error={error} />}
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.disabled}
          >
            {isLoading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <span>Request password reset</span>
            )}
          </Button>
        </form>
        <AnotherMethodSeparator />
        <div className="flex flex-col gap-3">
          <ContinueWithGoogleButton
            redirectUrl={redirectUrl}
            lastMethod={lastMethod}
            disabled={form.formState.disabled}
            setIsLoadingProvider={setIsLoadingProvider}
            setError={setError}
          />
          <ContinueWithPasswordButton
            redirectSearchParams={redirectSearchParams}
            lastMethod={lastMethod}
            disabled={form.formState.disabled}
          />
        </div>
      </div>
    </Form>
  );
}
