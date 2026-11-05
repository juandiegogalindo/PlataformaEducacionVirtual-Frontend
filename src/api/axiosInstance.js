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
  const token = useAuthStore.getState().accessToken;
  if (token && !RUTAS_SIN_TOKEN.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !esRutaAuth(originalRequest.url)) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await useAuthStore.getState().refreshAccessToken();
        resolveQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        resolveQueue(refreshError, null);
        useAuthStore.getState().limpiarSesion();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;