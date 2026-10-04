import api from "./axiosInstance";

export function loginRequest(correo, contrasena) {
  return api.post("/api/auth/login", { correo, contrasena });
}

export function registroRequest(datos) {
  return api.post("/api/auth/registro", datos);
}

export function refreshRequest(refreshToken) {
  return api.post("/api/auth/refresh", { refreshToken });
}

export function logoutRequest(refreshToken) {
  return api.post("/api/auth/logout", { refreshToken });
}

export function getPerfilRequest() {
  return api.get("/api/perfil");
}