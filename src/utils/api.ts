import axios from "axios";
import { getPublicBackendUrl } from "@/lib/backend";
import { getClientAuthToken } from "@/lib/client-auth";

const api = axios.create({
  baseURL: getPublicBackendUrl(),
});

api.interceptors.request.use(async (config) => {
  try {
    const token = getClientAuthToken();
    if (token) {
      config.headers = config.headers ?? {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // redirect to login
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
