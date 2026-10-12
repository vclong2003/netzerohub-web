import { createContext, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./_config.api";

export type Attachment = { id: string; name: string; url: string; size: number };
export type Centre = {
  id: number; name: string; address: string; latitude: number; longitude: number;
  materials: string[]; materialIds?: number[]; loadError?: string;
  photos: Attachment[]; infoSheets: Attachment[]; openingTime?: string; closingTime?: string;
};


export type WasteType = { id: number; name: string };
type TimeDto = string | { hour: number; minute: number; second?: number };
export type CentreDto = {
  id: number; name: string; address?: string; latitude: number; longitude: number;
  openingTime?: TimeDto; closingTime?: TimeDto;
  acceptedWasteTypes?: WasteType[]; imageUrls?: string[]; infoSheetUrls?: string[];
};
export type RequestOptions = { params?: Record<string, string | number>; signal?: AbortSignal };
export type RecyclingTransport = {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, payload: unknown): Promise<T>;
  put<T>(url: string, payload: unknown): Promise<T>;
  delete(url: string): Promise<unknown>;
};

function timeLabel(value?: TimeDto): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 5);
  return `${String(value.hour).padStart(2, "0")}:${String(value.minute).padStart(2, "0")}`;
}


function attachment(url: string): Attachment {
  let name = "Attachment";
  try { name = decodeURIComponent(new URL(url).pathname.split("/").pop() || name); } catch { /* Keep a readable fallback for old records. */ }
  return { id: url, name, url, size: 0 };
}

export function fromCentreDto(value: CentreDto): Centre {
  return {
    id: value.id, name: value.name, address: value.address || "",
    latitude: value.latitude, longitude: value.longitude,
    openingTime: timeLabel(value.openingTime), closingTime: timeLabel(value.closingTime),
    materials: (value.acceptedWasteTypes || []).map(type => type.name),
    materialIds: (value.acceptedWasteTypes || []).map(type => type.id),
    photos: (value.imageUrls || []).map(attachment), infoSheets: (value.infoSheetUrls || []).map(attachment),
  };
}

function details(centre: Centre) {
  return {
    name: centre.name.trim(), address: centre.address.trim(), latitude: centre.latitude, longitude: centre.longitude,
    ...(centre.openingTime ? { openingTime: `${centre.openingTime}:00` } : {}),
    ...(centre.closingTime ? { closingTime: `${centre.closingTime}:00` } : {}),
  };
}

function wasteIds(centre: Centre, wasteTypes: WasteType[]) {
  if (centre.materialIds) {
    return centre.materialIds.map(id => {
      if (!wasteTypes.some(type => type.id === id)) throw new Error("An accepted material is no longer available. Reload and select it again.");
      return id;
    });
  }
  return centre.materials.map(name => {
    const matches = wasteTypes.filter(item => item.name === name);
    if (matches.length !== 1) throw new Error(`Accepted material "${name}" cannot be identified. Reload and select it again.`);
    return matches[0].id;
  });
}

export function toUpdatePayload(centre: Centre, before: Centre, wasteTypes: WasteType[]) {
  const added = (next: Attachment[], previous: Attachment[]) => next.filter(file => !previous.some(old => old.url === file.url)).map(file => file.url);
  return {
    ...details(centre), acceptedWasteTypeIds: wasteIds(centre, wasteTypes),
    additionalImageUrls: added(centre.photos, before.photos), removedImageUrls: added(before.photos, centre.photos),
    additionalInfoSheetUrls: added(centre.infoSheets, before.infoSheets), removedInfoSheetUrls: added(before.infoSheets, centre.infoSheets),
  };
}

export class CreatedCentreError extends Error {
  constructor(public centre: Centre, reason: unknown) {
    super(`Center ${centre.id} was created, but saving or reading its details did not finish. Return to the list and reload before trying again. ${reason instanceof Error ? reason.message : ""}`);
    this.name = "CreatedCentreError";
  }
}

export function createRecyclingApi(client: RecyclingTransport) {
  const knownCentres = new Map<number, CentreDto>();
  async function canonicalUrls(urls: string[] = [], fallback: string[] = [], signal?: AbortSignal) {
    return Promise.all(urls.map(async (url, index) => {
      const candidate = url || fallback[index];
      if (!candidate) throw new Error("The server returned an empty attachment address. This center needs a backend data repair.");
      if (candidate.startsWith("s3://")) return candidate;
      const result = await client.get<{ bucketUrl: string }>("/storage/bucket-url", { params: { signedUrl: candidate }, signal });
      if (!result.bucketUrl?.startsWith("s3://")) throw new Error("Could not resolve this attachment address.");
      return result.bucketUrl;
    }));
  }
  async function read(id: number, signal?: AbortSignal) {
    const value = await client.get<CentreDto>(`/recycling-centres/${id}`, { signal });
    const previous = knownCentres.get(id);
    const [imageUrls, infoSheetUrls] = await Promise.all([
      canonicalUrls(value.imageUrls, previous?.imageUrls, signal), canonicalUrls(value.infoSheetUrls, previous?.infoSheetUrls, signal),
    ]);
    return fromCentreDto({ ...value, imageUrls, infoSheetUrls });
  }
  return {
    async list(name: string, page: number, pageSize: number, signal?: AbortSignal) {
      const result = await client.get<{ data: CentreDto[]; totalElements: number }>("/recycling-centres", {
        params: { page: Math.max(0, page - 1), pageSize, ...(name.trim() ? { name: name.trim() } : {}) }, signal,
      });
      result.data.forEach(value => knownCentres.set(value.id, value));
      // CentreDto omits acceptedWasteTypes in list responses; only detail returns them.
      const loaded = await Promise.allSettled(result.data.map(value => read(value.id, signal)));
      if (signal?.aborted) throw signal.reason || new Error("Loading cancelled.");
      const centres = loaded.map((entry, index): Centre => entry.status === "fulfilled" ? entry.value : {
        ...fromCentreDto(result.data[index]),
        loadError: entry.reason instanceof Error ? entry.reason.message : "Could not load center details.",
      });
      return { centres, total: result.totalElements };
    },
    wasteTypes: (signal?: AbortSignal) => client.get<WasteType[]>("/recycling-centres/waste-types", { signal }),
    get: (id: number) => read(id),
    async create(centre: Centre, types: WasteType[]) {
      if (centre.photos.length || centre.infoSheets.length) {
        throw new Error("Saving new attachments is temporarily unavailable. Your draft has been kept; no center was created.");
      }
      const acceptedWasteTypeIds = wasteIds(centre, types);
      const created = await client.post<CentreDto>("/recycling-centres", {
        ...details(centre), imageUrls: [], infoSheetUrls: [],
      });
      knownCentres.set(created.id, created);
      let persisted = created;
      try {
        const saved = await client.put<CentreDto>(`/recycling-centres/${created.id}`, {
          acceptedWasteTypeIds,
        });
        persisted = saved;
        knownCentres.set(saved.id, saved);
        return await read(created.id);
      }
      catch (error) { throw new CreatedCentreError(fromCentreDto(persisted), error); }
    },
    async update(centre: Centre, before: Centre, types: WasteType[]) {
      if (before.photos.length || before.infoSheets.length) {
        throw new Error("Editing centers with saved attachments is temporarily unavailable. No changes were sent.");
      }
      if (centre.photos.length || centre.infoSheets.length) {
        throw new Error("Saving new attachments is temporarily unavailable. No changes were sent.");
      }
      const saved = await client.put<CentreDto>(`/recycling-centres/${centre.id}`, toUpdatePayload(centre, before, types));
      knownCentres.set(saved.id, saved);
      return read(centre.id);
    },
    remove: (id: number) => client.delete(`/recycling-centres/${id}`),
    async upload(file: File): Promise<Attachment> {
      const form = new FormData();
      form.append("file", file);
      const result = await client.post<{ bucketUrl: string }>("/storage/upload", form);
      if (!result.bucketUrl) throw new Error("The upload did not return a file address. Please try again.");
      return { id: result.bucketUrl, name: file.name, url: result.bucketUrl, size: file.size };
    },
    async fileUrl(bucketUrl: string) {
      const result = await client.get<{ signedUrl: string }>("/storage/signed-url", { params: { bucketUrl } });
      if (!/^https?:\/\//i.test(result.signedUrl)) throw new Error("The file could not be opened. Please try again.");
      return result.signedUrl;
    },
  };
}

export type RecyclingCentreClient = ReturnType<typeof createRecyclingApi>;
export const RecyclingCentreClientContext = createContext<RecyclingCentreClient>(createRecyclingApi(api as unknown as RecyclingTransport));

export namespace RecyclingCentersQueries {
  export interface IGetCentresPayload { name?: string; page?: number; pageSize?: number }

  export function useGetCentres(payload: IGetCentresPayload) {
    const client = useContext(RecyclingCentreClientContext);
    return useQuery({
      queryKey: ["useGetCentres", payload],
      queryFn: async ({ signal }) => {
        const result = await client.list(payload.name || "", (payload.page || 0) + 1, payload.pageSize || 10, signal);
        return { data: result.centres, totalElements: result.total };
      },
    });
  }

  export function useGetCentreById(centreId: number) {
    const client = useContext(RecyclingCentreClientContext);
    return useQuery({
      queryKey: ["useGetCentreById", centreId],
      queryFn: () => client.get(centreId),
      enabled: Number.isInteger(centreId) && centreId > 0,
      refetchOnWindowFocus: false,
    });
  }

  export function useGetWasteTypes() {
    const client = useContext(RecyclingCentreClientContext);
    return useQuery({ queryKey: ["useGetCentreWasteTypes"], queryFn: ({ signal }) => client.wasteTypes(signal) });
  }
}

export namespace RecyclingCentersMutations {
  export interface ISaveCentrePayload { centre: Centre; wasteTypes: WasteType[] }
  export interface IUpdateCentrePayload extends ISaveCentrePayload { before: Centre }

  export function useCreateCentre() {
    const client = useContext(RecyclingCentreClientContext);
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["useCreateCentre"],
      mutationFn: ({ centre, wasteTypes }: ISaveCentrePayload) => client.create(centre, wasteTypes),
      onSettled: () => queryClient.invalidateQueries({ queryKey: ["useGetCentres"] }),
    });
  }

  export function useUpdateCentre(centreId: number) {
    const client = useContext(RecyclingCentreClientContext);
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["useUpdateCentre", centreId],
      mutationFn: ({ centre, before, wasteTypes }: IUpdateCentrePayload) => client.update(centre, before, wasteTypes),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["useGetCentres"] });
        await queryClient.invalidateQueries({ queryKey: ["useGetCentreById", centreId] });
      },
    });
  }

  export function useDeleteCentre(centreId: number) {
    const client = useContext(RecyclingCentreClientContext);
    const queryClient = useQueryClient();
    return useMutation({
      mutationKey: ["useDeleteCentre", centreId],
      mutationFn: () => client.remove(centreId),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["useGetCentres"] }),
    });
  }
}
