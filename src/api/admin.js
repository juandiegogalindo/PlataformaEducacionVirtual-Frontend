import api from "./axiosInstance";

const recursos = ["estudiantes", "docentes", "coordinadores", "administradores"];
const rolesCreables = ["docentes", "coordinadores", "administradores"];

export async function listarUsuariosRequest(signal) {
  const respuestas = await Promise.all(
    recursos.map((recurso) => api.get(`/api/admin/${recurso}`, { signal })),
  );
  return respuestas.flatMap(({ data }) => data);
}

export function crearUsuarioRequest(tipo, datos) {
  if (!rolesCreables.includes(tipo)) throw new Error("Tipo de usuario no permitido");
  return api.post(`/api/admin/${tipo}`, datos);
}

export function cambiarEstadoUsuarioRequest(id, activo) {
  return api.patch(`/api/admin/usuarios/${id}/${activo ? "activar" : "desactivar"}`);
}
