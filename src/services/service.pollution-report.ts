import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./_config.api";
import { IPageResponse } from "./_service.types";

export enum EPollutionReportStatus {
  Pending = "PENDING",
  Acknowledged = "ACKNOWLEDGED",
  Processed = "PROCESSED",
  Resolved = "RESOLVED",
  Rejected = "REJECTED",
}

export enum EPollutionType {
  Litter = "LITTER",
  Land = "LAND",
  Water = "WATER",
  Air = "AIR",
  Noise = "NOISE",
}

export interface IPollutionReport {
  id: string;
  title: string;
  description: string;
  type: EPollutionType;
  status: EPollutionReportStatus;
  imageUrl?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
}

export namespace PollutionReportQueries {
  export interface IGetPollutionReportsPayload {
    search?: string;
    page: number;
    pageSize: number;
  }
  export function useGetPollutionReports(payload: IGetPollutionReportsPayload) {
    return useQuery<IPageResponse<IPollutionReport>>({
      queryKey: ["useGetPollutionReports", payload],
      queryFn: ({ signal }) =>
        api.get("/pollution-reports", { params: payload, signal }),
    });
  }
}

export namespace PollutionReportMutations {
  export interface IUpdatePollutionReportStatusPayload {
    ids: number[];
    status: EPollutionReportStatus;
  }
  export function useUpdatePollutionReportStatus() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: IUpdatePollutionReportStatusPayload) =>
        api.put("/pollution-reports/status", payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["useGetPollutionReports"],
        });
      },
    });
  }
}
