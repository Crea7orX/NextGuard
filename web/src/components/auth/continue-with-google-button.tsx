import { LoaderCircle } from "lucide-react";
import React from "react";
import GoogleIcon from "~/assets/icons/google.svg";
import { LastLoginBadge } from "~/components/auth/last-login-badge";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Button> {
  redirectUrl: string;
  hideLastMethod?: boolean;
  disabled: boolean;
  setIsLoadingProvider?: React.Dispatch<React.SetStateAction<boolean>>;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ContinueWithGoogleButton({
  className,
  redirectUrl,
  hideLastMethod,
  disabled,
  setIsLoadingProvider,
  setError,
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
          setError?.(null);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setIsLoadingProvider?.(false);
          setError?.(ctx.error.message);
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
