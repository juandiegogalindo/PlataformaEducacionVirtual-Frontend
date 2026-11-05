import api from "./axiosInstance";

export function listarDocentesRequest() {
  return api.get("/api/docentes");
}