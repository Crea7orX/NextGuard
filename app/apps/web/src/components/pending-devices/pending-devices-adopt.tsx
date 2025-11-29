"use client";

import { Slot } from "@radix-ui/react-slot";
import type { AxiosError } from "axios";
import React from "react";
import { useAdoptPendingDeviceMutation } from "~/hooks/api/pending-devices/use-adopt-pending-device-mutation";
import type { ErrorResponse } from "~/lib/responses";
import { typeToConfirm } from "~/lib/type-to-confirm-store";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props extends React.ComponentProps<typeof Slot> {
  pendingDevice: PendingDeviceResponse;
  setAdoptDevice: React.Dispatch<
    React.SetStateAction<PendingDeviceResponse | undefined>
  >;
  setAdoptDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactNode;
}

export function PendingDevicesAdopt({
  pendingDevice,
  setAdoptDevice,
  setAdoptDialogOpen,
  children,
  ...props
}: Props) {
  const { mutateAsync: adopt } = useAdoptPendingDeviceMutation({
    id: pendingDevice.id,
  });

  async function handleClick() {
    if (pendingDevice.state === "auto_discovered") {
      const result = await typeToConfirm.show({
        title: "Adopt auto discovered device",
        description: "Are you sure you want to adopt this device?",
        warning: null,
        confirmText: "Adopt",
        confirmButtonText: "Adopt",
        confirmButtonVariant: "default",
        onConfirm: async () => {
          typeToConfirm.setIsLoading(true);
          await adopt()
            .then(() => {
              typeToConfirm.close(true);
            })
            .catch((error: AxiosError<ErrorResponse<string>>) => {
              typeToConfirm.setIsLoading(false);
              typeToConfirm.setMessage({
                message: error.response?.data.error,
              });
            });
        },
      });

      if (!result) return;
    }

    setAdoptDevice(pendingDevice);
    setAdoptDialogOpen(true);
  }

  return (
    <Slot onClick={handleClick} {...props}>
      {children}
    </Slot>
  );
}
