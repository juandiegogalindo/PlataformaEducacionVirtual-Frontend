import { create } from "zustand";
import { loginRequest, refreshRequest, logoutRequest, getPerfilRequest } from "../api/auth";
import { usaCookiesRefresh } from "../config/authConfig";

function conVersionFoto(usuario) {
  return usuario ? { ...usuario, fotoVersion: Date.now() } : usuario;
}

const CLAVES_SESION = ["accessToken", "refreshToken", "user"];

function leerSesion() {
  try {
    const user = localStorage.getItem("user");
    if (usaCookiesRefresh) localStorage.removeItem("refreshToken");
    return {
      user: user ? JSON.parse(user) : null,
      accessToken: localStorage.getItem("accessToken"),
      refreshToken: usaCookiesRefresh ? null : localStorage.getItem("refreshToken"),
    };
  } catch {
    limpiarSesionPersistida();
    return { user: null, accessToken: null, refreshToken: null };
  }
}

function limpiarSesionPersistida() {
  try {
    CLAVES_SESION.forEach((clave) => localStorage.removeItem(clave));
  } catch {
    // El estado en memoria siempre se limpia aunque el almacenamiento no esté disponible.
  }
}

function persistirSesion({ user, accessToken, refreshToken }) {
  try {
    localStorage.setItem("accessToken", accessToken);
    if (usaCookiesRefresh) localStorage.removeItem("refreshToken");
    else localStorage.setItem("refreshToken", refreshToken);
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  } catch (error) {
    limpiarSesionPersistida();
    throw new Error("No se pudo guardar la sesión de forma segura.", { cause: error });
  }
}

const sesionInicial = leerSesion();

export const useAuthStore = create((set, get) => ({
  ...sesionInicial,
  initialized: true,
  sessionVersion: 0,

  login: async (correo, contrasena) => {
    const { data } = await loginRequest(correo, contrasena);
    if (!data?.accessToken || (!usaCookiesRefresh && !data?.refreshToken)) {
      throw new Error("La respuesta de autenticación no contiene los datos de sesión esperados.");
    }

    const sessionVersion = get().sessionVersion + 1;
    try {
      persistirSesion({ accessToken: data.accessToken, refreshToken: data.refreshToken || null, user: null });
      set({ accessToken: data.accessToken, refreshToken: data.refreshToken || null, user: null, sessionVersion });

      const perfil = await getPerfilRequest();
      const usuario = conVersionFoto(perfil.data);
      persistirSesion({ accessToken: data.accessToken, refreshToken: data.refreshToken || null, user: usuario });
      set({ user: usuario });
      return usuario;
    } catch (error) {
      limpiarSesionPersistida();
      set({ user: null, accessToken: null, refreshToken: null, sessionVersion });
      throw error;
    }
  },

  refreshAccessToken: async (expectedVersion = get().sessionVersion) => {
    if (expectedVersion !== get().sessionVersion) {
      throw new Error("La sesión cambió mientras se renovaba el token.");
    }
    const refreshToken = usaCookiesRefresh ? null : get().refreshToken;
    if (!usaCookiesRefresh && !refreshToken) throw new Error("No hay refresh token");

    const { data } = await refreshRequest(refreshToken);
    if (expectedVersion !== get().sessionVersion || !data?.accessToken) {
      throw new Error("La sesión cambió o la renovación no devolvió un token válido.");
    }
    const nuevoRefreshToken = usaCookiesRefresh ? null : (data.refreshToken || refreshToken);
    try {
      persistirSesion({ user: get().user, accessToken: data.accessToken, refreshToken: nuevoRefreshToken });
    } catch (error) {
      get().limpiarSesion();
      throw error;
    }
    set({ accessToken: data.accessToken, refreshToken: nuevoRefreshToken });
    return data.accessToken;
  },

  limpiarSesion: () => {
    limpiarSesionPersistida();
    set((state) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionVersion: state.sessionVersion + 1,
    }));
  },

  logout: async () => {
    const refreshToken = usaCookiesRefresh ? null : get().refreshToken;
    try {
      await logoutRequest(refreshToken);
    } catch {
      // si el backend ya no responde, igual limpiamos la sesión local
    }
    get().limpiarSesion();
  },

  setUser: (user) => {
    const usuario = conVersionFoto(user);
    persistirSesion({
      user: usuario,
      accessToken: get().accessToken,
      refreshToken: get().refreshToken,
    });
    set({ user: usuario });
  },
}));