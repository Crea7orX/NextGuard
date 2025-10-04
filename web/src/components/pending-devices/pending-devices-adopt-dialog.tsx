"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { PendingDevicesDelete } from "~/components/pending-devices/pending-devices-delete";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "~/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty";
import { Spinner } from "~/components/ui/spinner";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props extends React.ComponentProps<typeof Dialog> {
  pendingDevice?: PendingDeviceResponse;
}

export function PendingDevicesAdoptDialog({ pendingDevice, ...props }: Props) {
  if (!pendingDevice) return null;
  return (
    <Dialog {...props}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adopting device</DialogTitle>
        </DialogHeader>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="default">
              <Spinner className="size-16" />
            </EmptyMedia>
            <EmptyTitle>Waiting for the device to respond</EmptyTitle>
            <EmptyDescription>
              Make sure the device is powered on, it is connected to a network
              or a hub and the mounting lid is removed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <PendingDevicesDelete pendingDevice={pendingDevice}>
              <Button size="sm" variant="destructive">
                Remove device
              </Button>
            </PendingDevicesDelete>
          </EmptyContent>
        </Empty>
      </DialogContent>
    </Dialog>
  );
}
