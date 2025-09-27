"use client";

import { EllipsisVertical } from "lucide-react";
import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { UserDropdownMenu } from "~/components/user/user-dropdown-menu";
import { authClient } from "~/lib/auth-client";

export function UserSidebarMenu() {
  const { data: session, isPending, error } = authClient.useSession();
  const isLoading = !session || isPending || !!error;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserDropdownMenu>
          <SidebarMenuButton
            variant="outline"
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </>
            ) : (
              <>
                <AvatarWithFallback
                  image={session.user.image}
                  name={session.user.name}
                  twoLetter
                />
                <span className="truncate text-left text-sm leading-tight font-medium">
                  {session.user.name}
                </span>
              </>
            )}
            <EllipsisVertical className="ml-auto size-4" />
          </SidebarMenuButton>
        </UserDropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
