import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { EventResponse } from "~/lib/validation/events";

export function useGetAllEventsQuery({
  ...options
}: Partial<UseQueryOptions<EventResponse[], AxiosError>>) {
  return useQuery<EventResponse[], AxiosError>({
    ...options,
    queryKey: ["Events", "GetAll"],
    queryFn: async () =>
      (await axiosInstance.get<SuccessResponse<EventResponse[]>>("/events"))
        .data.data,
  });
}
