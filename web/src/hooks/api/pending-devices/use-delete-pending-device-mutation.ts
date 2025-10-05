import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props {
  id: string;
}

export function useDeletePendingDeviceMutation({ id }: Props) {
  const queryClient = useQueryClient();

  return useMutation<PendingDeviceResponse, AxiosError>({
    mutationKey: ["PendingDevices", "Delete"],
    mutationFn: async () =>
      (
        await axiosInstance.delete<SuccessResponse<PendingDeviceResponse>>(
          `/pending_devices/${id}`,
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
