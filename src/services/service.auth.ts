import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./_config.api";

export enum EAccountRole {
  User = "User",
  Admin = "Admin",
}

export interface IAccount {
  id: number;
  code: string;
  email: string;
  role: EAccountRole;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export namespace AuthQueries {
  export function useMyAccount() {
    return useQuery<IAccount>({
      queryKey: ["useMyAccount"],
      queryFn: ({ signal }) => api.get("/account/me", { signal }),
    });
  }
}

export namespace AuthMutations {
  export interface ILoginPayload {
    email: string;
    password: string;
  }
  export interface ILoginResponse {
    accessToken: string;
    refreshToken: string;
  }

  export function useLogin() {
    const queryClient = useQueryClient();

    return useMutation<ILoginResponse, Error, ILoginPayload>({
      mutationKey: ["useLogin"],
      mutationFn: (payload: ILoginPayload) => api.post("/auth/login", payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["useMyAccount"] });
      },
    });
  }
}
