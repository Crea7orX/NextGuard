import { Building } from "lucide-react";
import { SpaceSelectDropdownMenu } from "~/components/spaces/space-select-dropdown-menu";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

export function SelectSpacePrompt({
  className,
  ...props
}: React.ComponentProps<typeof Empty>) {
  return (
    <Empty className={className} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12">
          <Building className="size-8" />
        </EmptyMedia>
        <EmptyTitle>No active space</EmptyTitle>
        <EmptyDescription>Select a space to get started.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <SpaceSelectDropdownMenu sideOffset={8}>
          <Button>Select space</Button>
        </SpaceSelectDropdownMenu>
      </EmptyContent>
    </Empty>
  );
}
