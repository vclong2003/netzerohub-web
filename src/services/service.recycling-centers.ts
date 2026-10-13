import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./_config.api";
import { IPageResponse } from "./_service.types";

export type WasteType = { id: number; name: string; code: string };

export type Centre = {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  acceptedWasteTypes: WasteType[];
  imageUrls: string[];
  infoSheetUrls?: string[];
};

export namespace RecyclingCentersQueries {
  export interface IGetCentresPayload {
    name?: string;
    page?: number;
    pageSize?: number;
  }

  export function useGetCentres(payload: IGetCentresPayload) {
    return useQuery<IPageResponse<Centre>>({
      queryKey: ["useGetCentres", payload],
      queryFn: async ({ signal }) =>
        api.get("/recycling-centres", { params: payload, signal }),
    });
  }

  export function useGetCentreById(centreId: number) {
    return useQuery<Centre>({
      queryKey: ["useGetCentreById", centreId],
      queryFn: () => api.get(`/recycling-centres/${centreId}`),
      enabled: Number.isInteger(centreId) && centreId > 0,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    });
  }

  export function useGetWasteTypes() {
    return useQuery<WasteType[]>({
      queryKey: ["useGetCentreWasteTypes"],
      queryFn: ({ signal }) =>
        api.get("/recycling-centres/waste-types", { signal }),
    });
  }
}

export namespace RecyclingCentersMutations {
  export interface ICreateCentrePayload {
    name: string;
    latitude: number;
    longitude: number;
    openingTime: string;
    closingTime: string;
    address: string;
    imageUrls?: string[];
    infoSheetUrls?: string[];
  }
  export interface IUpdateCentrePayload {
    name?: string;
    latitude?: number;
    longitude?: number;
    openingTime?: string;
    closingTime?: string;
    address?: string;
    acceptedWasteTypeIds?: number[];
    additionalImageUrls?: string[];
    removedImageUrls?: string[];
    additionalInfoSheetUrls?: string[];
    removedInfoSheetUrls?: string[];
  }

  export function useCreateCentre() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["useCreateCentre"],
      mutationFn: (payload: ICreateCentrePayload) =>
        api.post("/recycling-centres", payload),
      onSettled: () =>
        queryClient.invalidateQueries({ queryKey: ["useGetCentres"] }),
    });
  }

  export function useUpdateCentre(centreId: number) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["useUpdateCentre", centreId],
      mutationFn: (payload: IUpdateCentrePayload) =>
        api.put(`/recycling-centres/${centreId}`, payload),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["useGetCentres"] });
        await queryClient.invalidateQueries({
          queryKey: ["useGetCentreById", centreId],
        });
      },
    });
  }

  export function useDeleteCentre(centreId: number) {
    const queryClient = useQueryClient();

    return useMutation({
      mutationKey: ["useDeleteCentre", centreId],
      mutationFn: () => api.delete(`/recycling-centres/${centreId}`),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: ["useGetCentres"] }),
    });
  }
}
