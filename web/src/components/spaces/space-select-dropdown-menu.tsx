"use client";

import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

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
    void queryClient.resetQueries();
    setIsLoading(false);
  }

  return (
    <>
      <DropdownMenu open={isOpen || isLoading} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          className="max-w-(--radix-dropdown-menu-trigger-width) min-w-64"
          {...props}
        >
          {activeSpace && (
            <>
              <div className="flex items-center justify-between gap-2 px-2 py-1.5">
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
              <DropdownMenuSeparator />
            </>
          )}
          {isSpacesPending &&
            Array.from({ length: 3 }).map((_, i) => (
              <React.Fragment key={i}>
                <DropdownMenuItem disabled={true}>
                  <SpaceInfoSkeleton hasRole={i === 0 && !activeSpace} />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </React.Fragment>
            ))}
          {spaces?.map(
            (space) =>
              space.id !== activeSpace?.id && (
                <div key={space.id}>
                  <DropdownMenuItem
                    className="group cursor-pointer justify-between"
                    onClick={() => switchSpace(space.id)}
                    disabled={isLoading}
                  >
                    <SpaceInfo
                      image={space.logo}
                      name={space.name}
                      className="text-accent-foreground"
                    />
                    <ArrowRight className="not-group-focus-visible:hidden" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              ),
          )}
          <DropdownMenuItem
            className="text-accent-foreground cursor-pointer font-bold"
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
