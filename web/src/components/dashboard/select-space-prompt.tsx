import { Building } from "lucide-react";
import { SpaceSelectDropdownMenu } from "~/components/spaces/space-select-dropdown-menu";
import { Button } from "~/components/ui/button";

export function SelectSpacePrompt({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={className} {...props}>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-muted text-muted-foreground inline-flex size-12 items-center justify-center rounded-md border p-2.5">
          <Building className="size-6" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="font-bold">No active space</h2>
          <p className="text-muted-foreground text-sm">
            Select a space to get started.
          </p>
        </div>
        <SpaceSelectDropdownMenu sideOffset={8}>
          <Button>Select space</Button>
        </SpaceSelectDropdownMenu>
      </div>
    </div>
  );
}
