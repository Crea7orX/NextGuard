import {
  keepPreviousData,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { type AxiosError } from "axios";
import type { SearchParams } from "nuqs";
import { useParseSearchParams } from "~/hooks/use-parse-search-params";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { DevicesPaginatedResponse } from "~/lib/validation/devices";

interface Props
  extends Partial<UseQueryOptions<DevicesPaginatedResponse, AxiosError>> {
  searchParams: SearchParams;
}

export function useGetAllDevicesQuery({ searchParams, ...options }: Props) {
  const search = useParseSearchParams(searchParams);

  return useQuery<DevicesPaginatedResponse, AxiosError>({
    ...options,
    queryKey: ["Devices", "GetAll", searchParams],
    queryFn: async () =>
      (
        await axiosInstance.get<SuccessResponse<DevicesPaginatedResponse>>(
          `/devices?${search}`,
        )
      ).data.data,
    placeholderData: keepPreviousData,
  });
}
