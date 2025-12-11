import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type AxiosError } from "axios";
import { axiosInstance } from "~/lib/axios";
import type { SuccessResponse } from "~/lib/responses";

interface Props {
  id: string;
}

export function useArmSpaceByIdMutation({ id }: Props) {
  const queryClient = useQueryClient();

  return useMutation<undefined, AxiosError>({
    mutationKey: ["Spaces", "Arm"],
    mutationFn: async () =>
      (
        await axiosInstance.post<SuccessResponse<undefined>>(
          `/spaces/${id}/arm`,
        )
      ).data.data,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["Spaces", "Get", id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["Events", "GetAll"],
        }),
      ]),
  });
}
