export function mensajeError(err, porDefecto = "Ocurrió un error inesperado") {
  if (!err) return porDefecto;
  if (err.code === "ERR_CANCELED" || err.name === "CanceledError") {
    return "La solicitud fue cancelada.";
  }
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT") {
    return "La solicitud tardó demasiado. Inténtalo de nuevo.";
  }
  if (!err.response) {
    return "No se pudo conectar con el servidor. Inténtalo de nuevo en unos segundos.";
  }

  const { status, data } = err.response;
  if (data?.mensaje) return data.mensaje;
  const mensajes = {
    400: "La solicitud no es válida. Revisa los datos ingresados.",
    401: "Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.",
    403: "No tienes permiso para hacer esta acción.",
    404: "No se encontró el recurso solicitado.",
    409: "La operación entra en conflicto con información existente.",
    413: "El archivo pesa demasiado (máximo 5 MB).",
    422: "Los datos enviados no superan la validación.",
    429: "Hay demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo.",
    500: "El servidor encontró un error interno. Inténtalo más tarde.",
  };
  return mensajes[status] || porDefecto;
}