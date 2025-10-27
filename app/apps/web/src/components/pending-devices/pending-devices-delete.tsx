"use client";

import { Slot } from "@radix-ui/react-slot";
import type { AxiosError } from "axios";
import { useDeletePendingDeviceMutation } from "~/hooks/api/pending-devices/use-delete-pending-device-mutation";
import type { ErrorResponse } from "~/lib/responses";
import { typeToConfirm } from "~/lib/type-to-confirm-store";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props extends React.ComponentProps<typeof Slot> {
  pendingDevice: PendingDeviceResponse;
  children?: React.ReactNode;
}

export function PendingDevicesDelete({
  pendingDevice,
  children,
  ...props
}: Props) {
  const { mutateAsync: doDelete } = useDeletePendingDeviceMutation({
    id: pendingDevice.id,
  });

  function handleClick() {
    void typeToConfirm.show({
      title: "Remove pending device",
      description: "Are you sure you want to remove this device?",
      confirmText: "Remove",
      confirmButtonText: "Remove",
      onConfirm: async () => {
        typeToConfirm.setIsLoading(true);
        await doDelete()
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
  }

  return (
    <Slot onClick={handleClick} {...props}>
      {children}
    </Slot>
  );
}
