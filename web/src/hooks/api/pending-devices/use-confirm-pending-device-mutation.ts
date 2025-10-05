import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { DeviceResponse } from "~/lib/validation/devices";
import type { PendingDeviceConfirm } from "~/lib/validation/pending-device";

interface Props {
  id: string;
}

export function useConfirmPendingDeviceMutation({ id }: Props) {
  const queryClient = useQueryClient();

  return useMutation<DeviceResponse, AxiosError, PendingDeviceConfirm>({
    mutationKey: ["PendingDevices", "Confirm"],
    mutationFn: async (body) =>
      (
        await axiosInstance.post<SuccessResponse<DeviceResponse>>(
          `/pending_devices/${id}/confirm`,
          body,
        )
      ).data.data,
    onSuccess: () =>
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["PendingDevices", "GetAll"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["PendingDevices", "Get", id],
        }),
      ]),
  });
}
