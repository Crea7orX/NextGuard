"use client";

import React from "react";
import { AccountUpdateProfileCard } from "~/components/account/account-update-profile-card";
import { AnimatedContainer } from "~/components/common/animated-container";
import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

export function AccountProfileSection({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { data: session, isPending, error } = authClient.useSession();
  const isSessionLoading = !session || isPending || !!error;

  const [isUpdating, setIsUpdating] = React.useState(false);

  return (
    <div
      className={cn("flex flex-col items-start gap-2 lg:flex-row", className)}
      {...props}
    >
      <div className="lg:w-52 lg:translate-y-3">
        <p>Profile</p>
      </div>
      <AnimatedContainer
        className="w-full lg:flex-1"
        uniqueKey={isUpdating ? "updating" : "default"}
        alwaysAvailable
      >
        {!isUpdating || isSessionLoading ? (
          <div className="flex flex-1 items-center gap-2 max-lg:pl-2 lg:gap-4">
            {isSessionLoading ? (
              <>
                <Skeleton className="size-12 rounded-full" />
                <Skeleton className="h-4 w-52" />
                <Skeleton className="ml-auto h-8 w-42" />
              </>
            ) : (
              <>
                <AvatarWithFallback
                  image={session.user.image}
                  name={session.user.name}
                  twoLetter
                  largeSize
                  className="size-10 sm:size-12"
                />
                <p className="truncate font-semibold">{session.user.name}</p>
                <Button
                  variant="outline"
                  className="ml-auto"
                  onClick={() => setIsUpdating(true)}
                >
                  Update profile
                </Button>
              </>
            )}
          </div>
        ) : (
          <AccountUpdateProfileCard
            className="w-full"
            onClose={() => setIsUpdating(false)}
            name={session.user.name}
            image={session.user.image}
          />
        )}
      </AnimatedContainer>
    </div>
  );
}
