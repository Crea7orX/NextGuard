import { PlusCircle, Smartphone } from "lucide-react";
import { PendingDevicesCreateDialog } from "~/components/pending-devices/pending-devices-create-dialog";
import { Button } from "~/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";

export function DevicesEmpty({
  className,
  ...props
}: React.ComponentProps<typeof Empty>) {
  return (
    <Empty className={className} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-12">
          <Smartphone className="size-8" />
        </EmptyMedia>
        <EmptyTitle>No devices found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your filters or add a new device.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <PendingDevicesCreateDialog>
          <Button variant="outline" size="sm">
            <PlusCircle className="size-4" />
            Add device
          </Button>
        </PendingDevicesCreateDialog>
      </EmptyContent>
    </Empty>
  );
}
