import api from "./axiosInstance";

export function actualizarPerfilRequest(datos) {
  return api.patch("/api/perfil", datos);
}

export function cambiarContrasenaRequest(datos) {
  return api.patch("/api/perfil/contrasena", datos);
}