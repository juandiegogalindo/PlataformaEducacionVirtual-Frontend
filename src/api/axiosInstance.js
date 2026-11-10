import axios from "axios";
import { useAuthStore } from "../auth/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const RUTAS_SIN_TOKEN = ["/api/auth/login", "/api/auth/registro", "/api/auth/refresh"];

function esRutaAuth(url) {
  return Boolean(url?.startsWith("/api/auth/"));
}

api.interceptors.request.use((config) => {
  const { accessToken, sessionVersion } = useAuthStore.getState();
  config._authSessionVersion = sessionVersion;
  if (accessToken && !RUTAS_SIN_TOKEN.includes(config.url)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  const currentVersion = useAuthStore.getState().sessionVersion;
  pendingQueue.forEach(({ resolve, reject, sessionVersion }) => {
    if (error || sessionVersion !== currentVersion) reject(error || new Error("La sesión cambió."));
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") return Promise.reject(error);
    if (!originalRequest) return Promise.reject(error);

    const currentSessionVersion = useAuthStore.getState().sessionVersion;
    if (originalRequest._authSessionVersion !== currentSessionVersion) {
      return Promise.reject(new Error("La sesión cambió mientras la solicitud estaba pendiente."));
    }

    if (error.response?.status === 401 && !originalRequest._retry && !esRutaAuth(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, sessionVersion: currentSessionVersion });
        }).then((newToken) => {
          if (useAuthStore.getState().sessionVersion !== currentSessionVersion) {
            throw new Error("La sesión cambió mientras la solicitud estaba pendiente.");
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken(currentSessionVersion);
        resolveQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        const status = refreshError.response?.status;
        if ([400, 401, 403].includes(status)) {
          useAuthStore.getState().limpiarSesion();
          if (window.location.pathname !== "/login") window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
