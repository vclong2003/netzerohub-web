import { useMutation } from "@tanstack/react-query";
import { api } from "./_config.api";

export namespace StorageMutations {
  export interface IUploadFilePayload {
    file: File;
  }

  export interface IUploadFileResponse {
    bucketUrl: string;
  }

  export function useUploadFile() {
    return useMutation<IUploadFileResponse, Error, IUploadFilePayload>({
      mutationKey: ["useUploadFile"],
      mutationFn: async ({ file }) => {
        const formData = new FormData();

        formData.append("file", file);
        const response = await api.post<IUploadFileResponse>(
          "/storage/upload",
          formData,
        );

        return response as unknown as IUploadFileResponse;
      },
    });
  }
}
