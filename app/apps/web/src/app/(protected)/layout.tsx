import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type * as React from "react";
import { auth } from "~/lib/auth";

interface Props {
  children: React.ReactNode;
}

export default async function ProtectedLayout({ children }: Props) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    const currentPath = (await headers()).get("x-href") ?? "/";
    const encodedRedirectUrl = encodeURIComponent(currentPath);
    redirect(`/auth/sign-in?redirect_url=${encodedRedirectUrl}`);
  }

  return children;
}
