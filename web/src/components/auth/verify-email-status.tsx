"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { ContinueWithPasswordButton } from "~/components/auth/continue-with-password-button";
import {
  FormResponseMessage,
  type FormResponseMessageProps,
} from "~/components/ui/form";
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

  const redirectSearchParams = React.useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    return params.toString();
  }, [searchParams]);

  React.useEffect(() => {
    setIsInitialLoading(false);
    if (searchParams.get("error") === "token_expired") {
      setMessage({
        message:
          "Verification token expired. Please try again signing in to your account.",
      });
      return;
    }

    setMessage({
      message:
        "Email verified successfully. You will be redirected after 5 seconds.",
      variant: "success",
    });
    setTimeout(() => {
      void router.push(`/auth/sign-in?${redirectSearchParams}`);
    }, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();
  const disabled =
    isInitialLoading || isLoadingProvider || message?.variant === "success";

  return (
    <>
      <FormResponseMessage className="mb-4" {...message} />
      <div className={cn("grid gap-6", className)} {...props}>
        {isInitialLoading && (
          <LoaderCircle className="size-12 animate-spin justify-self-center" />
        )}
        <AnotherMethodSeparator />
        <div className="flex flex-col gap-3">
          <ContinueWithGoogleButton
            redirectUrl={redirectUrl}
            disabled={disabled}
            setIsLoadingProvider={setIsLoadingProvider}
            setMessage={setMessage}
          />
          <ContinueWithPasswordButton
            redirectSearchParams={redirectSearchParams}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}
