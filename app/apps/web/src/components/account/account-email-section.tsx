"use client";

import { motion } from "motion/react";
import React from "react";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export function AccountEmailSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data: session, isPending, error } = authClient.useSession();
  const isSessionLoading = !session || isPending || !!error;

  return (
    <div
      className={cn("flex flex-col items-start gap-2 lg:flex-row", className)}
      {...props}
    >
      <div className="lg:w-52">
        <p>Email address</p>
      </div>
      <div className="flex w-full flex-1 items-center gap-2 max-lg:pl-2">
        {isSessionLoading ? (
          <Skeleton className="h-4 w-64" />
        ) : (
          <>
            <p className="truncate text-sm">{session.user.email}</p>
            {session.user.emailVerified && (
              <Badge asChild>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.2, delay: 0.4, ease: "easeOut" }}
                >
                  Verified
                </motion.div>
              </Badge>
            )}
          </>
        )}
      </div>
    </div>
  );
}
