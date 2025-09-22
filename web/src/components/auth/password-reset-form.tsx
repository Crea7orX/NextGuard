"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { ContinueWithPasswordButton } from "~/components/auth/continue-with-password-button";
import { ErrorAlert } from "~/components/auth/error-alert";
import { SuccessAlert } from "~/components/auth/success-alert";
import { LoadingButton } from "~/components/common/loading-button";
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
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";
import {
  resetPasswordSchema,
  type ResetPassword,
} from "~/lib/validation/auth/reset-password";

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
      setError("Invalid or expired token");
    setIsInitialLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

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
          setSuccess(null);
          setError(null);
        },
        onSuccess: () => {
          setSuccess(
            "Password reset successfully. Now you can sign in with your new password. You will be redirected to the sign in page after 5 seconds.",
          );
          setTimeout(() => {
            void router.push(`/auth/sign-in?${redirectSearchParams}`);
          }, 5000);
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
        {isInitialLoading ? (
          <LoaderCircle className="size-12 animate-spin justify-self-center" />
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <div className="group relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0.5 right-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm new password</FormLabel>
                  <FormControl>
                    <div className="group relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your new password"
                        autoComplete="new-password"
                        className="pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-0.5 right-0.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
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
            setError={setError}
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
