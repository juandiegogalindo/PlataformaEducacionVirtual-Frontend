import api from "./axiosInstance";

export function listarLeccionesRequest(cursoId) {
  return api.get(`/api/cursos/${cursoId}/lecciones`);
}

export function crearLeccionRequest(cursoId, datos) {
  return api.post(`/api/cursos/${cursoId}/lecciones`, datos);
}

export function actualizarLeccionRequest(cursoId, leccionId, datos) {
  return api.put(`/api/cursos/${cursoId}/lecciones/${leccionId}`, datos);
}

export function eliminarLeccionRequest(cursoId, leccionId) {
  return api.delete(`/api/cursos/${cursoId}/lecciones/${leccionId}`);
}