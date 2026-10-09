import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./_config.api";
import { IPageResponse } from "./_service.types";

export enum EPlugStatus {
  Available = "Available",
  Occupied = "Occupied",
  OutOfService = "OutOfService",
  Faulted = "Faulted",
}

export enum EPlugType {
  TYPE1 = "TYPE1",
  TYPE2 = "TYPE2",
  CCS = "CCS",
  CHAdeMO = "CHAdeMO",
  TESLA = "TESLA",
}

export enum ECurrentType {
  AC = "AC",
  DC = "DC",
}

export interface IPlug {
  id: number;
  identifier: string;
  status: EPlugStatus;
  type: EPlugType;
  currentType: ECurrentType;
  powerKw: number;
  createdAt: string;
  updatedAt: string;
}

export enum EStationStatus {
  Active = "Active",
  Inactive = "Inactive",
}

export interface IStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  renewableEnergyPercent: number;
  status: EStationStatus;
  imageUrls: string[];
  plugs: IPlug[];
  createdAt: string;
  updatedAt: string;
}

export namespace GreenChargingStationsQueries {
  export interface IGetStationsPayload {
    name?: string;
    status?: EStationStatus;
    renewableEnergyPercent?: number;
    plugType?: EPlugType;
    page?: number;
    pageSize?: number;
  }

  export function useGetStations(payload: IGetStationsPayload) {
    return useQuery<IPageResponse<IStation>>({
      queryKey: ["useGetStations", payload],
      queryFn: ({ signal }) =>
        api.get("/green-charging-stations", { params: payload, signal }),
    });
  }

  export function useGetStationById(stationId: number) {
    return useQuery<IStation>({
      queryKey: ["useGetStationById", stationId],
      queryFn: ({ signal }) =>
        api.get(`/green-charging-stations/${stationId}`, { signal }),
    });
  }
}

export namespace GreenChargingStationsMutations {
  export interface ICreateStationPayload {
    name: string;
    latitude: number;
    longitude: number;
    renewableEnergyPercent: number;
    imageUrls?: string[];
  }

  export interface IUpdateStationPayload {
    name?: string;
    latitude?: number;
    longitude?: number;
    renewableEnergyPercent?: number;
    status?: EStationStatus;
    imageUrls?: string[];
  }

  export function useCreateStation() {
    const queryClient = useQueryClient();

    return useMutation<IStation, Error, ICreateStationPayload>({
      mutationKey: ["useCreateStation"],
      mutationFn: (payload: ICreateStationPayload) =>
        api.post("/green-charging-stations", payload),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["useGetStations"] });
      },
    });
  }

  export function useUpdateStation(stationId: number) {
    const queryClient = useQueryClient();

    return useMutation<IStation, Error, IUpdateStationPayload>({
      mutationKey: ["useUpdateStation", stationId],
      mutationFn: (payload: IUpdateStationPayload) =>
        api.put(`/green-charging-stations/${stationId}`, payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["useGetStationById", stationId],
        });
        queryClient.invalidateQueries({ queryKey: ["useGetStations"] });
      },
    });
  }

  export function useDeleteStation(stationId: number) {
    const queryClient = useQueryClient();

    return useMutation<void, Error, void>({
      mutationKey: ["useDeleteStation", stationId],
      mutationFn: () => api.delete(`/green-charging-stations/${stationId}`),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["useGetStations"] });
      },
    });
  }
}
