"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import GoogleIcon from "~/assets/icons/google.svg";
import { ErrorAlert } from "~/components/auth/error-alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authClient } from "~/lib/auth-client";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const searchParams = useSearchParams();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/",
    [searchParams],
  );

  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);

  function googleSignIn() {
    void authClient.signIn.social(
      {
        provider: "google",
        callbackURL: redirectUrl,
      },
      {
        onRequest: () => {
          setIsLoadingGoogle(true);
          setError(null);
        },
        onError: (ctx) => {
          setIsLoadingGoogle(false);
          setError(ctx.error.message);
        },
      },
    );
  }

  return (
    <form className={className} {...props}>
      <div className="grid gap-6">
        {error && <ErrorAlert error={error} />}
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={googleSignIn}
        >
          {isLoadingGoogle ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Login with Google
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-3">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-muted-foreground ml-auto text-sm underline-offset-4 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute top-0.5 right-0.5 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href={`/auth/sign-up?${searchParams.toString()}`}
            className="underline underline-offset-4"
          >
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
}
