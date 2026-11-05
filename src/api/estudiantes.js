import api from "./axiosInstance";

export function listarInscritosRequest(cursoId, estado) {
  return api.get(`/api/cursos/${cursoId}/estudiantes`, { params: estado ? { estado } : {} });
}

export function verProgresoEstudianteRequest(cursoId, estudianteId) {
  return api.get(`/api/cursos/${cursoId}/estudiantes/${estudianteId}/progreso`);
}