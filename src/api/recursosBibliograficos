import api from "./axiosInstance";

export function listarRecursosRequest(cursoId) {
  return api.get(`/api/cursos/${cursoId}/recursos`);
}

export function crearRecursoRequest(cursoId, datos) {
  return api.post(`/api/cursos/${cursoId}/recursos`, datos);
}

export function actualizarRecursoRequest(cursoId, recursoId, datos) {
  return api.put(
    `/api/cursos/${cursoId}/recursos/${recursoId}`,
    datos
  );
}

export function eliminarRecursoRequest(cursoId, recursoId) {
  return api.delete(
    `/api/cursos/${cursoId}/recursos/${recursoId}`
  );
}