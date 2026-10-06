import api from "./axiosInstance";

export function listarCursosRequest() {
  return api.get("/api/cursos");
}

export function verCursoRequest(id) {
  return api.get(`/api/cursos/${id}`);
}