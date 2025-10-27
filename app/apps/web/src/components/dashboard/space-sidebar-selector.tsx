"use client";

import { ChevronsUpDown } from "lucide-react";
import { AvatarWithFallback } from "~/components/common/avatar-with-fallback";
import { SpaceSelectDropdownMenu } from "~/components/spaces/space-select-dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Skeleton } from "~/components/ui/skeleton";
import { authClient } from "~/lib/auth-client";

export function SpaceSidebarSelector() {
  const {
    data: activeSpace,
    isPending,
    isRefetching,
  } = authClient.useActiveOrganization();

  let body = activeSpace ? (
    <>
      <AvatarWithFallback
        className="rounded-sm"
        image={activeSpace?.logo}
        name={activeSpace.name}
      />
      <span className="truncate font-medium">{activeSpace.name}</span>
    </>
  ) : (
    <>
      <Skeleton className="size-6 rounded-sm" />
      <span className="text-muted-foreground text-xs">Select a space</span>
    </>
  );

  if (isPending) {
    body = (
      <>
        <Skeleton className="size-6 rounded-sm" />
        <Skeleton className="h-4 w-32" />
      </>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SpaceSelectDropdownMenu align="start">
          <SidebarMenuButton
            disabled={isPending || isRefetching}
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            variant="outline"
          >
            {body}
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </SpaceSelectDropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
