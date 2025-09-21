"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { ContinueWithPasswordButton } from "~/components/auth/continue-with-password-button";
import { ErrorAlert } from "~/components/auth/error-alert";
import { SuccessAlert } from "~/components/auth/success-alert";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export function VerifyEmailStatus({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/dashboard",
    [searchParams],
  );
  const lastMethod = authClient.getLastUsedLoginMethod();

  const redirectSearchParams = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    return params.toString();
  }, [searchParams]);

  React.useEffect(() => {
    setIsInitialLoading(false);
    if (searchParams.get("error") === "token_expired") {
      setError(
        "Verification token expired. Please try again signing in to your account.",
      );
      return;
    }

    setSuccess(
      "Email verified successfully. You will be redirected after 5 seconds.",
    );
    setTimeout(() => {
      void router.push(`/auth/sign-in?${redirectSearchParams}`);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const disabled =
    isInitialLoading || isLoadingProvider || typeof success === "string";

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {success && <SuccessAlert success={success} />}
      {error && <ErrorAlert error={error} />}
      {isInitialLoading && (
        <LoaderCircle className="size-12 animate-spin justify-self-center" />
      )}
      <AnotherMethodSeparator />
      <div className="flex flex-col gap-3">
        <ContinueWithGoogleButton
          redirectUrl={redirectUrl}
          lastMethod={lastMethod}
          disabled={disabled}
          setIsLoadingProvider={setIsLoadingProvider}
          setError={setError}
        />
        <ContinueWithPasswordButton
          redirectSearchParams={redirectSearchParams}
          lastMethod={lastMethod}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
