import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios";
import type {
  PendingDeviceCreate,
  PendingDeviceResponse,
} from "~/lib/validation/pending-device";

export function useCreatePendingDeviceMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    AxiosResponse<PendingDeviceResponse>,
    AxiosError,
    PendingDeviceCreate
  >({
    mutationKey: ["PendingDevices", "Create"],
    mutationFn: (create) => axiosInstance.post("/pending_devices", create),
    onSuccess: () =>
      void queryClient.invalidateQueries({
        queryKey: ["PendingDevices", "GetAll"],
      }),
  });
}
