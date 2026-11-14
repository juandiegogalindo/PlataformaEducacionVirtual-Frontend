export function validarFiltrosReporte({ tipoReporte, periodo }) {
  if (!tipoReporte?.trim()) return "Selecciona el tipo de reporte.";
  if (tipoReporte.trim().toUpperCase() !== "MATRICULAS") {
    return "El tipo de reporte debe ser matrículas.";
  }
  if (!periodo?.trim()) return "Ingresa el período académico.";
  if (!/^\d{4}-[12]$/.test(periodo.trim())) {
    return "El período debe tener el formato YYYY-1 o YYYY-2.";
  }
  return "";
}

export function prepararFiltrosReporte({ tipoReporte, periodo, programa, cursoId }) {
  const filtros = {
    tipoReporte: tipoReporte.trim().toUpperCase(),
    periodo: periodo.trim(),
  };
  if (programa?.trim()) filtros.programa = programa.trim();
  if (cursoId) filtros.cursoId = Number(cursoId);
  return filtros;
}

export function nombreArchivoRespuesta(headers, nombrePorDefecto) {
  const disposicion = headers?.["content-disposition"] || headers?.["Content-Disposition"] || "";
  const coincidencia = disposicion.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i);
  return coincidencia ? decodeURIComponent(coincidencia[1].trim()) : nombrePorDefecto;
}

export function resultadosReporte(data) {
  return Array.isArray(data?.resultados) ? data.resultados : [];
}
