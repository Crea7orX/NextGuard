"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { type auth } from "~/lib/auth";

interface Props {
  children: React.ReactNode;
  session: typeof auth.$Infer.Session | null;
}

export function NotLoggedIn({ children, session }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    if (!session) return;
    const redirectUrl = searchParams.get("redirect_url") ?? "/dashboard";
    router.push(redirectUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      {!session ? (
        children
      ) : (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Redirecting</CardTitle>
          </CardHeader>
          <CardContent>
            <LoaderCircle className="size-16 animate-spin justify-self-center" />
          </CardContent>
        </Card>
      )}
    </>
  );
}
