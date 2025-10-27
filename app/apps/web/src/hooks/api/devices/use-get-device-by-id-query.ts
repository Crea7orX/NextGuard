import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { DeviceResponse } from "~/lib/validation/devices";

interface Props extends Partial<UseQueryOptions<DeviceResponse, AxiosError>> {
  id: string;
}

export function useGetDeviceByIdQuery({ id, ...options }: Props) {
  return useQuery<DeviceResponse, AxiosError>({
    ...options,
    queryKey: ["Devices", "Get", id],
    queryFn: async () =>
      (
        await axiosInstance.get<SuccessResponse<DeviceResponse>>(
          `/devices/${id}`,
        )
      ).data.data,
  });
}
