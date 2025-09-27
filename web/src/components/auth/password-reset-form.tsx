"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { ContinueWithPasswordButton } from "~/components/auth/continue-with-password-button";
import { LoadingButton } from "~/components/common/loading-button";
import { PasswordInput } from "~/components/common/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormResponseMessage,
  type FormResponseMessageProps,
} from "~/components/ui/form";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import {
  resetPasswordSchema,
  type ResetPassword,
} from "~/lib/validation/auth/password";

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/dashboard",
    [searchParams],
  );

  const redirectSearchParams = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("token");
    params.delete("error");
    return params.toString();
  }, [searchParams]);

  React.useEffect(() => {
    if (!searchParams.get("token")) {
      void router.push(`/auth/sign-in?${redirectSearchParams}`);
      return;
    }
    if (searchParams.get("error") === "INVALID_TOKEN")
      setMessage({ message: "Invalid or expired token" });
    setIsInitialLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();

  const form = useForm<ResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
    disabled: isInitialLoading || isLoading || isLoadingProvider,
  });

  function onSubmit(data: ResetPassword) {
    void authClient.resetPassword(
      {
        newPassword: data.password,
        token: searchParams.get("token") ?? "",
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setMessage(undefined);
        },
        onSuccess: () => {
          setMessage({
            message:
              "Password reset successfully. Now you can sign in with your new password. You will be redirected to the sign in page after 5 seconds.",
            variant: "success",
          });
          setTimeout(() => {
            void router.push(`/auth/sign-in?${redirectSearchParams}`);
          }, 5000);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setMessage({ message: ctx.error.message });
        },
      },
    );
  }

  return (
    <Form {...form}>
      <FormResponseMessage className="mb-4" {...message} />
      <div className={cn("grid gap-6", className)} {...props}>
        {isInitialLoading ? (
          <LoaderCircle className="size-12 animate-spin justify-self-center" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter your new password"
                      autoComplete="new-password"
                      invalid={!!fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Confirm your new password"
                      autoComplete="new-password"
                      invalid={!!fieldState.invalid}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={form.formState.disabled}
            >
              Reset password
            </LoadingButton>
          </form>
        )}
        <AnotherMethodSeparator />
        <div className="flex flex-col gap-3">
          <ContinueWithGoogleButton
            redirectUrl={redirectUrl}
            disabled={form.formState.disabled}
            setIsLoadingProvider={setIsLoadingProvider}
            setMessage={setMessage}
          />
          <ContinueWithPasswordButton
            redirectSearchParams={redirectSearchParams}
            disabled={form.formState.disabled}
          />
        </div>
      </div>
    </Form>
  );
}
