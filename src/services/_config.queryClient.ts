import { QueryClient as BaseQueryClient } from "@tanstack/react-query";

export function useQueryClient() {
  const queryClient = new BaseQueryClient({
    defaultOptions: { queries: { retry: 2 } },
  });

  return { queryClient };
}
