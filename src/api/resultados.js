import api from "./axiosInstance";

export function registrarResultadoRequest(evaluacionId, contenido) {
  return api.post(`/api/evaluaciones/${evaluacionId}/resultados`, { contenido });
}

export function misCalificacionesRequest() {
  return api.get("/api/resultados/mis-calificaciones");
}

export function calificacionesCursoRequest(cursoId) {
  return api.get(`/api/cursos/${cursoId}/calificaciones`);
}

export function calificarResultadoRequest(id, datos) {
  return api.patch(`/api/resultados/${id}/calificar`, datos);
}
