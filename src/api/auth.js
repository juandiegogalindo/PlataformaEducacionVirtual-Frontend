import api from "./axiosInstance";

export function loginRequest(correo, contrasena) {
  return api.post("/api/auth/login", { correo, contrasena });
}

export function registroRequest(datos) {
  return api.post("/api/auth/registro", datos);
}

export function refreshRequest(refreshToken) {
  return api.post("/api/auth/refresh", refreshToken ? { refreshToken } : undefined);
}

export function logoutRequest(refreshToken) {
  return api.post("/api/auth/logout", refreshToken ? { refreshToken } : undefined);
}

export function csrfRequest() {
  return api.get("/api/auth/csrf", { _skipCsrf: true, _skipAuthSession: true });
}

export function getPerfilRequest() {
  return api.get("/api/perfil");
}