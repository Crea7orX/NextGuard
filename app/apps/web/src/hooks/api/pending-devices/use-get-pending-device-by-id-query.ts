import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { PendingDeviceResponse } from "~/lib/validation/pending-device";

interface Props
  extends Partial<UseQueryOptions<PendingDeviceResponse, AxiosError>> {
  id: string;
}

export function useGetPendingDeviceByIdQuery({ id, ...options }: Props) {
  return useQuery<PendingDeviceResponse, AxiosError>({
    ...options,
    queryKey: ["PendingDevices", "Get", id],
    queryFn: async () =>
      (
        await axiosInstance.get<SuccessResponse<PendingDeviceResponse>>(
          `/pending_devices/${id}`,
        )
      ).data.data,
  });
}
