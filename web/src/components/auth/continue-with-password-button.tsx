import { Lock } from "lucide-react";
import Link from "next/link";
import React from "react";
import { LastLoginBadge } from "~/components/auth/last-login-badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface Props extends React.ComponentProps<typeof Button> {
  redirectSearchParams?: string;
  lastMethod?: string | null;
  disabled: boolean;
}

export function ContinueWithPasswordButton({
  className,
  redirectSearchParams,
  lastMethod,
  disabled,
  ...props
}: Props) {
  return (
    <Button
      variant="outline"
      className={cn("relative w-full", className)}
      disabled={true}
      asChild={!disabled}
      {...props}
    >
      {disabled ? (
        <ButtonContent lastMethod={lastMethod} />
      ) : (
        <Link href={`/auth/sign-in?${redirectSearchParams ?? ""}`}>
          <ButtonContent lastMethod={lastMethod} />
        </Link>
      )}
    </Button>
  );
}

interface ButtonContentProps {
  lastMethod?: string | null;
}

export function ButtonContent({ lastMethod }: ButtonContentProps) {
  return (
    <>
      {lastMethod === "email" && <LastLoginBadge />}
      <Lock />
      Continue with your password
    </>
  );
}
