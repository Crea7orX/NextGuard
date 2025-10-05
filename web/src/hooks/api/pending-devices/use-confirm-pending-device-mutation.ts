import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { HubResponse } from "~/lib/validation/hubs";
import type { PendingDeviceConfirm } from "~/lib/validation/pending-device";

interface Props {
  id: string;
}

export function useConfirmPendingDeviceMutation({ id }: Props) {
  const queryClient = useQueryClient();

  // TODO: use proper type based on device type
  return useMutation<HubResponse, AxiosError, PendingDeviceConfirm>({
    mutationKey: ["PendingDevices", "Confirm"],
    mutationFn: async (body) =>
      (
        await axiosInstance.post<SuccessResponse<HubResponse>>(
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
