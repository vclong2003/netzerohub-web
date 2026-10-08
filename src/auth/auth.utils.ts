const REFRESH_TOKEN_LOCAL_STORAGE_KEY = "rftk";
const ACCESS_TOKEN_LOCAL_STORAGE_KEY = "acstk";

export namespace AuthStorage {
  export const getAccessToken = (): string | null => {
    return localStorage.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  };

  export const setAccessToken = (accessToken: string) => {
    if (!accessToken) return;
    localStorage.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, accessToken);
  };

  export const getRefreshToken = (): string | null => {
    return localStorage.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
  };

  export const setRefreshToken = (refreshToken: string) => {
    if (!refreshToken) return;
    localStorage.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, refreshToken);
  };

  export const clearAuthStorage = () => {
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
  };
}
