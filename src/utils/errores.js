export function mensajeError(err, porDefecto = "Ocurrió un error inesperado") {
  if (!err.response) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.";
  }

  const { status, data } = err.response;
  if (data?.mensaje) return data.mensaje;
  if (status === 413) return "El archivo pesa demasiado (máximo 5 MB).";
  if (status === 403) return "No tienes permiso para hacer esta acción.";
  return porDefecto;
}