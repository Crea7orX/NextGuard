"use client";

import { ArrowRight, Plus, Settings } from "lucide-react";
import React from "react";
import { CreateSpaceDialog } from "~/components/spaces/create-space-dialog";
import { SpaceInfo, SpaceInfoSkeleton } from "~/components/spaces/space-info";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { authClient } from "~/lib/auth-client";

interface Props extends React.ComponentProps<typeof DropdownMenuContent> {
  children: React.ReactNode;
}

export function SpaceSelectDropdownMenu({ children, ...props }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  const {
    data: spaces,
    refetch: refetchSpaces,
    isPending: isSpacesPending,
  } = authClient.useListOrganizations();
  const { data: activeSpace } = authClient.useActiveOrganization();
  const { data: member, refetch: refetchMember } = authClient.useActiveMember();

  const [isLoading, setIsLoading] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);

  async function switchSpace(spaceId: string) {
    setIsLoading(true);
    await authClient.organization.setActive({ organizationId: spaceId });
    await Promise.all([refetchSpaces(), refetchMember()]);
    setIsLoading(false);
  }

  return (
    <>
      <DropdownMenu open={isOpen || isLoading} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          className="max-w-(--radix-dropdown-menu-trigger-width) min-w-64 p-0"
          {...props}
        >
          {activeSpace && (
            <>
              <div className="flex items-center justify-between gap-2 p-2">
                <SpaceInfo
                  image={activeSpace.logo}
                  name={activeSpace.name}
                  role={member?.role}
                />
                <DropdownMenuItem asChild disabled={isLoading}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-auto cursor-pointer gap-1 py-1 text-xs"
                  >
                    <Settings />
                    Manage
                  </Button>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="m-0" />
            </>
          )}
          {isSpacesPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <React.Fragment key={i}>
                <DropdownMenuItem disabled={true}>
                  <SpaceInfoSkeleton hasRole={i === 0 && !activeSpace} />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="m-0" />
              </React.Fragment>
            ))}
          {spaces?.map(
            (space) =>
              space.id !== activeSpace?.id && (
                <div key={space.id}>
                  <DropdownMenuItem
                    className="group cursor-pointer justify-between gap-2 rounded-none p-2"
                    onClick={() => switchSpace(space.id)}
                    disabled={isLoading}
                  >
                    <SpaceInfo
                      image={space.logo}
                      name={space.name}
                      className="text-muted-foreground"
                    />
                    <ArrowRight className="not-group-hover:hidden" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="m-0" />
                </div>
              ),
          )}
          <DropdownMenuItem
            className="text-muted-foreground cursor-pointer gap-2 rounded-t-none rounded-b-md p-2 font-bold"
            onClick={() => setCreateDialogOpen(true)}
            disabled={isLoading || isSpacesPending}
          >
            <Plus className="size-6 rounded-full border-2 border-dashed" />
            Create space
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateSpaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
}
