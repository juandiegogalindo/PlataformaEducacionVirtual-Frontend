import { create } from "zustand";
import { loginRequest, refreshRequest, logoutRequest, getPerfilRequest } from "../api/auth";

function conVersionFoto(usuario) {
  return usuario ? { ...usuario, fotoVersion: Date.now() } : usuario;
}

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
    const usuario = conVersionFoto(perfil.data);
    localStorage.setItem("user", JSON.stringify(usuario));
    set({ user: usuario });

    return usuario;
  },

  refreshAccessToken: async () => {
    const refreshToken = get().refreshToken;
    if (!refreshToken) throw new Error("No hay refresh token");

    const { data } = await refreshRequest(refreshToken);
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  },

  limpiarSesion: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  logout: async () => {
    const refreshToken = get().refreshToken;
    try {
      if (refreshToken) await logoutRequest(refreshToken);
    } catch {
      // si el backend ya no responde, igual limpiamos la sesión local
    }
    get().limpiarSesion();
  },

  setUser: (user) => {
    const usuario = conVersionFoto(user);
    localStorage.setItem("user", JSON.stringify(usuario));
    set({ user: usuario });
  },
}));