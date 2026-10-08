import { AuthStorage } from "@/auth/auth.utils";
import { ApiTypes } from "@/types/types.api";
import axios from "axios";

export const api = axios.create({
  baseURL: ApiTypes.API_HOST,
});

let tokenRefreshPromise: ReturnType<typeof refreshAccessToken> | null = null;

async function refreshAccessToken() {
  const refreshToken = AuthStorage.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");
  const response = await api.get(`/auth/refresh?refreshToken=${refreshToken}`);
  const { accessToken } = response as unknown as { accessToken: string };
  AuthStorage.setAccessToken(accessToken);
}

api.interceptors.request.use(
  async (config) => {
    config.params = config.params || {};

    const accessToken = AuthStorage.getAccessToken();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const originalRequest = error.config;

    // if error related to auth, try to get new access token
    const isRetry = originalRequest._retry;
    if (error.response?.status === 401 && !isRetry) {
      originalRequest._retry = true; // mark as has been retried

      if (!tokenRefreshPromise) tokenRefreshPromise = refreshAccessToken();
      await tokenRefreshPromise;
      tokenRefreshPromise = null;

      return api(originalRequest);
    }

    const serverMessage =
      (typeof error.response?.data === "string"
        ? error.response.data
        : error.response?.data?.message) || "An error occurred";
    if (serverMessage) error.message = serverMessage;
    console.log("----- api error:", error);
    return Promise.reject(error);
  },
);
