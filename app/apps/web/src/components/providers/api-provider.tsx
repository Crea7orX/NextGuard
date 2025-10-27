"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AxiosResponse, { AxiosError } from "axios";
import * as React from "react";

export const noRetryStatusCodes = [400, 401, 403, 404, 500];

interface ApiProviderProps {
  children: React.ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (_, error) => {
              if (
                error instanceof AxiosError &&
                error.response instanceof AxiosResponse
              ) {
                return !noRetryStatusCodes.includes(error.response.status);
              }

              return true;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
