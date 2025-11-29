"use client";

import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import { Skeleton } from "~/components/ui/skeleton";
import { UserDropdownMenu } from "~/components/user/user-dropdown-menu";
import { authClient } from "~/lib/auth-client";

export function UserNav({
  className,
  ...props
}: React.ComponentProps<typeof UserDropdownMenu>) {
  const { data: session, isPending, error } = authClient.useSession();
  const isLoading = !session || isPending || !!error;

  return (
    <UserDropdownMenu className={className} {...props}>
      {isLoading ? (
        <Skeleton className="size-6 rounded-full" />
      ) : (
        <AvatarWithFallback
          image={session.user.image}
          name={session.user.name}
          twoLetter
        />
      )}
    </UserDropdownMenu>
  );
}
