import api from "./axiosInstance";

export function verProgresoRequest(cursoId) {
  return api.get(`/api/cursos/${cursoId}/progreso`);
}

export function marcarProgresoRequest(cursoId, leccionId, completado) {
  return api.patch(`/api/cursos/${cursoId}/lecciones/${leccionId}/progreso`, { completado });
}