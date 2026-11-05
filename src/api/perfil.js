import api from "./axiosInstance";

export function actualizarPerfilRequest(datos) {
  return api.patch("/api/perfil", datos);
}

export function cambiarContrasenaRequest(datos) {
  return api.patch("/api/perfil/contrasena", datos);
}

export function subirFotoRequest(archivo) {
  const formData = new FormData();
  formData.append("foto", archivo);
  return api.put("/api/perfil/foto", formData);
}

export function eliminarFotoRequest() {
  return api.delete("/api/perfil/foto");
}