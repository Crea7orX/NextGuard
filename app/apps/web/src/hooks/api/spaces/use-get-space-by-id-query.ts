import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";
import type { SpaceResponse } from "~/lib/validation/spaces";

interface Props extends Partial<UseQueryOptions<SpaceResponse, AxiosError>> {
  id: string;
}

export function useGetSpaceByIdQuery({ id, ...options }: Props) {
  return useQuery<SpaceResponse, AxiosError>({
    ...options,
    queryKey: ["Spaces", "Get", id],
    queryFn: async () =>
      (await axiosInstance.get<SuccessResponse<SpaceResponse>>(`/spaces/${id}`))
        .data.data,
  });
}
