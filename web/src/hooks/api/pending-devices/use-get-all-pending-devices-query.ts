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
import type { PendingDevicesPaginatedResponse } from "~/lib/validation/pending-device";

interface UseGetAllPendingDevicesQueryProps
  extends Partial<
    UseQueryOptions<PendingDevicesPaginatedResponse, AxiosError>
  > {
  searchParams: SearchParams;
}

export function useGetAllPendingDevicesQuery({
  searchParams,
  ...options
}: UseGetAllPendingDevicesQueryProps) {
  const search = useParseSearchParams(searchParams);

  return useQuery<PendingDevicesPaginatedResponse, AxiosError>({
    ...options,
    queryKey: ["PendingDevices", "GetAll", searchParams],
    queryFn: async () =>
      (
        await axiosInstance.get<
          SuccessResponse<PendingDevicesPaginatedResponse>
        >(`/pending_devices?${search}`)
      ).data.data,
    placeholderData: keepPreviousData,
  });
}
