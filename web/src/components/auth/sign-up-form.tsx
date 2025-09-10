"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React from "react";
import GoogleIcon from "~/assets/icons/google.svg";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form className={className} {...props}>
      <div className="grid gap-6">
        <Button variant="outline" className="w-full">
          <GoogleIcon />
          Register with Google
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-3">
              <Label htmlFor="first-name">Frist Name</Label>
              <Input id="first-name" placeholder="John" required />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Doe" required />
            </div>
          </div>
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
            <Label htmlFor="password">Password</Label>
            <div className="group relative">
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
          </div>
          <div className="grid gap-3">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="group relative">
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                required
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
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </div>
        <div className="text-center text-sm">
          Have an account?{" "}
          <Link href="/auth/sign-in" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </form>
  );
}
