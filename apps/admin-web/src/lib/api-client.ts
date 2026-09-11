import axios from "axios";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

/**
 * On a 401 from an expired access token, attempt exactly one silent refresh
 * (concurrent 401s share the same in-flight refresh) and retry the original
 * request. If the refresh itself fails, the session is truly over — let the
 * 401 propagate so callers (see auth-context.tsx) can redirect to /login.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (response?.status !== 401 || config.__isRetry || config.url?.includes("/auth/")) {
      throw error;
    }

    config.__isRetry = true;

    refreshPromise ??= apiClient
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });

    try {
      await refreshPromise;
      return apiClient(config);
    } catch {
      throw error;
    }
  }
);
