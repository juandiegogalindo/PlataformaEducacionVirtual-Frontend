import api from "./axiosInstance";

const RUTA_REPORTES = "/api/reportes/academicos";

export function consultarReporteAcademicoRequest(filtros) {
  return api.get(RUTA_REPORTES, { params: filtros });
}

export function exportarReporteAcademicoRequest(formato, filtros) {
  return api.get(`${RUTA_REPORTES}/exportar/${formato}`, {
    params: filtros,
    responseType: "blob",
  });
}
