import api from "./axiosInstance";

export function inscribirseRequest(cursoId) {
  return api.post("/api/inscripciones", { cursoId });
}

export function misCursosRequest() {
  return api.get("/api/inscripciones/mis-cursos");
}

export function cancelarInscripcionRequest(inscripcionId) {
  return api.patch(`/api/inscripciones/${inscripcionId}/cancelar`);
}