import { LoaderCircle } from "lucide-react";
import React from "react";
import GoogleIcon from "~/assets/icons/google.svg";
import { LastLoginBadge } from "~/components/auth/last-login-badge";
import { Button } from "~/components/ui/button";
import type { FormResponseMessageProps } from "~/components/ui/form";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Button> {
  redirectUrl: string;
  hideLastMethod?: boolean;
  disabled: boolean;
  setIsLoadingProvider?: React.Dispatch<React.SetStateAction<boolean>>;
  setMessage?: React.Dispatch<
    React.SetStateAction<FormResponseMessageProps | undefined>
  >;
}

export function ContinueWithGoogleButton({
  className,
  redirectUrl,
  hideLastMethod,
  disabled,
  setIsLoadingProvider,
  setMessage,
  ...props
}: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const isLastMethod = authClient.isLastUsedLoginMethod("google");

  function googleSignIn() {
    void authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setIsLoadingProvider?.(true);
          setMessage?.(undefined);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setIsLoadingProvider?.(false);
          setMessage?.({ message: ctx.error.message });
        },
      },
    );
  }

  return (
    <Button
      variant="outline"
      className={cn("relative w-full", className)}
      disabled={disabled}
      onClick={googleSignIn}
      {...props}
    >
      {isLastMethod && !hideLastMethod && <LastLoginBadge />}
      {isLoading ? <LoaderCircle className="animate-spin" /> : <GoogleIcon />}
      Continue with Google
    </Button>
  );
}
