"use client";

import { Bell, LogOut, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";

interface Props extends React.ComponentProps<typeof DropdownMenuContent> {
  children?: React.ReactNode;
}

export function UserDropdownMenu({ children, ...props }: Props) {
  const router = useRouter();

  const [isOpen, setIsOpen] = React.useState(false);

  const { data: session, isPending, error, refetch } = authClient.useSession();
  const isSessionLoading = !session || isPending || !!error;

  const [isLoading, setIsLoading] = React.useState(false);
  const disabled = isSessionLoading || isLoading;

  async function logout() {
    setIsLoading(true);
    await authClient.signOut();
    router.refresh();
    setIsLoading(false);
  }

  return (
    <>
      <DropdownMenu open={isOpen || isLoading} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
          align="end"
          {...props}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              {isSessionLoading ? (
                <>
                  <Skeleton className="size-6 rounded-full border" />
                  <div className="grid flex-1 gap-1">
                    <Skeleton className="h-4 w-40 border" />
                    <Skeleton className="h-4 w-46 border" />
                  </div>
                </>
              ) : (
                <>
                  <AvatarWithFallback
                    image={session.user.image}
                    name={session.user.name}
                  />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session.user.name}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {session.user.email}
                    </span>
                  </div>
                </>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem disabled={disabled}>
              <UserCircle />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled}>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} disabled={disabled}>
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
