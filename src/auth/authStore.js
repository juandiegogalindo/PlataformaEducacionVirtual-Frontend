import { create } from "zustand";
import { loginRequest, refreshRequest, logoutRequest, getPerfilRequest } from "../api/auth";

export const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  accessToken: localStorage.getItem("accessToken") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,

  login: async (correo, contrasena) => {
    const { data } = await loginRequest(correo, contrasena);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ accessToken: data.accessToken, refreshToken: data.refreshToken });

    const perfil = await getPerfilRequest();
    localStorage.setItem("user", JSON.stringify(perfil.data));
    set({ user: perfil.data });

    return perfil.data;
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    const { data } = await refreshRequest(refreshToken);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // si el backend ya no responde, igual limpiamos la sesión local
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, refreshToken: null });
  },
}));