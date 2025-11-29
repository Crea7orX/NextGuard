import { Trash } from "lucide-react";
import { PendingDevicesAdopt } from "~/components/pending-devices/pending-devices-adopt";
import { PendingDevicesDelete } from "~/components/pending-devices/pending-devices-delete";
import { Button } from "~/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "~/components/ui/button-group";
import { cn } from "~/lib/utils";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props extends React.ComponentProps<typeof ButtonGroup> {
  pendingDevice: PendingDeviceResponse;
  setAdoptDevice: React.Dispatch<
    React.SetStateAction<PendingDeviceResponse | undefined>
  >;
  setAdoptDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function PendingDevicesActions({
  className,
  pendingDevice,
  setAdoptDevice,
  setAdoptDialogOpen,
  ...props
}: Props) {
  return (
    <ButtonGroup className={cn("ml-auto", className)} {...props}>
      <PendingDevicesAdopt
        pendingDevice={pendingDevice}
        setAdoptDevice={setAdoptDevice}
        setAdoptDialogOpen={setAdoptDialogOpen}
      >
        {pendingDevice.state === "waiting_user_confirmation" ? (
          <Button>Add</Button>
        ) : (
          <Button variant="outline">Adopt</Button>
        )}
      </PendingDevicesAdopt>
      <ButtonGroupSeparator />
      <PendingDevicesDelete pendingDevice={pendingDevice}>
        <Button size="icon" variant="destructive">
          <Trash className="size-4" />
        </Button>
      </PendingDevicesDelete>
    </ButtonGroup>
  );
}
