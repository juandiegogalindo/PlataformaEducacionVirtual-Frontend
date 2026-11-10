import api from "./axiosInstance";

export function listarEvaluacionesRequest(cursoId) {
  return api.get(`/api/cursos/${cursoId}/evaluaciones`);
}

export function crearEvaluacionRequest(cursoId, tipo, datos) {
  if (!["TAREA", "EXAMEN"].includes(tipo)) throw new Error("Tipo de evaluación no válido");
  return api.post(`/api/cursos/${cursoId}/${tipo === "TAREA" ? "tareas" : "examenes"}`, datos);
}

export function verEvaluacionRequest(tipo, id) {
  if (!["tareas", "examenes"].includes(tipo)) throw new Error("Tipo de evaluación no válido");
  return api.get(`/api/${tipo}/${id}`);
}

export function publicarEvaluacionRequest(id) {
  return api.patch(`/api/evaluaciones/${id}/publicar`);
}
