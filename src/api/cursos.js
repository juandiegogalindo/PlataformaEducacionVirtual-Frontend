import api from "./axiosInstance";

export function listarCursosRequest() {
  return api.get("/api/cursos");
}

export function verCursoRequest(id) {
  return api.get(`/api/cursos/${id}`);
}

export function crearCursoRequest(datos) {
  return api.post("/api/cursos", datos);
}

export function actualizarCursoRequest(id, datos) {
  return api.put(`/api/cursos/${id}`, datos);
}

export function archivarCursoRequest(id) {
  return api.delete(`/api/cursos/${id}`);
}