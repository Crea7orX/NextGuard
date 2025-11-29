"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { AnotherMethodSeparator } from "~/components/auth/another-method-separator";
import { ContinueWithGoogleButton } from "~/components/auth/continue-with-google-button";
import { LoadingButton } from "~/components/common/loading-button";
import {
  FormResponseMessage,
  type FormResponseMessageProps,
} from "~/components/ui/form";
import { env } from "~/env";
import { useCountdown } from "~/hooks/use-countdown";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export function VerifyEmail({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/dashboard",
    [searchParams],
  );

  const redirectSearchParams = searchParams.toString();

  const initialRequest = React.useRef(true);
  React.useEffect(() => {
    if (!searchParams.get("email")) {
      void router.push(`/auth/sign-in?${redirectSearchParams}`);
      return;
    }
    if (!initialRequest.current) return;
    initialRequest.current = false;
    requestVerifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingProvider, setIsLoadingProvider] = React.useState(false);
  const [message, setMessage] = React.useState<FormResponseMessageProps>();
  const disabled = isInitialLoading || isLoading || isLoadingProvider;

  const [count, { startCountdown, resetCountdown }, isCountdownRunning] =
    useCountdown({
      countStart: 30,
      intervalMs: 1000,
    });

  function requestVerifyEmail() {
    const email = searchParams.get("email") ?? "";

    void authClient.sendVerificationEmail(
      {
        email,
        callbackURL: `${env.NEXT_PUBLIC_BASE_URL}/auth/verify-email/token?${redirectSearchParams}`,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setMessage(undefined);
        },
        onResponse: () => {
          setIsInitialLoading(false);
          setIsLoading(false);
          resetCountdown();
          startCountdown();
        },
        onSuccess: () => {
          setMessage({
            message: `We've sent an email to ${email}. Follow the link to verify your email address.`,
            variant: "success",
          });
        },
        onError: (ctx) => {
          setMessage({ message: ctx.error.message });
        },
      },
    );
  }

  return (
    <>
      <FormResponseMessage className="mb-4" {...message} />
      <div className={cn("grid gap-6", className)} {...props}>
        {isInitialLoading ? (
          <LoaderCircle className="size-12 animate-spin justify-self-center" />
        ) : (
          <LoadingButton
            className="w-full"
            isLoading={isLoading}
            disabled={disabled || isCountdownRunning}
            onClick={requestVerifyEmail}
          >
            {isCountdownRunning ? (
              <span key="resend">Resend after {count}s</span>
            ) : (
              <span key="send">Send verification email</span>
            )}
          </LoadingButton>
        )}
        <AnotherMethodSeparator />
        <ContinueWithGoogleButton
          redirectUrl={redirectUrl}
          disabled={disabled}
          setIsLoadingProvider={setIsLoadingProvider}
          setMessage={setMessage}
        />
      </div>
    </>
  );
}
