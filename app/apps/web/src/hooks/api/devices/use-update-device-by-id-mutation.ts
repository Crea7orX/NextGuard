import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { DeviceResponse, DeviceUpdate } from "~/lib/validation/devices";

interface Props {
  id: string;
}

export function useUpdateDeviceByIdMutation({ id }: Props) {
  const queryClient = useQueryClient();

  return useMutation<DeviceResponse, AxiosError, DeviceUpdate>({
    mutationKey: ["Devices", "Update"],
    mutationFn: async (body) =>
      (
        await axiosInstance.patch<SuccessResponse<DeviceResponse>>(
          `/devices/${id}`,
          body,
        )
      ).data.data,
    onSuccess: () =>
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["Devices", "GetAll"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["Devices", "Get", id],
        }),
      ]),
  });
}
