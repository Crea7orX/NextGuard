"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import GoogleIcon from "~/assets/icons/google.svg";
import { ErrorAlert } from "~/components/auth/error-alert";
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
import { signUpSchema, type SignUp } from "~/lib/validation/auth/sign-up";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = React.useMemo(
    () => searchParams.get("redirect_url") ?? "/dashboard",
    [searchParams],
  );

  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = React.useState(false);

  const form = useForm<SignUp>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      firstName: "",
      lastName: "",
    },
    disabled: isLoading || isLoadingGoogle,
  });

  function onSubmit(data: SignUp) {
    void authClient.signUp.email(
      {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        callbackURL: redirectUrl, // Don't know why it doesn't work, only checking for valid value in the request
      },
      {
        onRequest: () => {
          setIsLoading(true);
          setError(null);
        },
        onSuccess: () => {
          router.push(redirectUrl);
        },
        onError: (ctx) => {
          setIsLoading(false);
          setError(ctx.error.message);
        },
      },
    );
  }

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
    <Form {...form}>
      <div className={cn("grid gap-6", className)} {...props}>
        {error && <ErrorAlert error={error} />}
        <Button
          variant="outline"
          className="w-full"
          disabled={form.formState.disabled}
          onClick={googleSignIn}
        >
          {isLoadingGoogle ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Register with Google
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
          <div className="grid grid-cols-2 items-start gap-3">
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your first name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-3">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your last name"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="grid gap-3">
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
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="group relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
          </div>
          <div className="grid gap-3">
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="group relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
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
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.disabled}
          >
            {isLoading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <span>Sign Up</span>
            )}
          </Button>
        </form>
        <div className="text-center text-sm">
          Have an account?{" "}
          <Link
            href={`/auth/sign-in?${searchParams.toString()}`}
            className="underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </Form>
  );
}
