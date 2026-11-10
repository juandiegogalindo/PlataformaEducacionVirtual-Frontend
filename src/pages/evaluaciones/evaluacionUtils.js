export const ESTADOS_EVALUACION = {
  BORRADOR: { label: "Borrador", variant: "neutral" },
  PUBLICADA: { label: "Publicada", variant: "success" },
  CERRADA: { label: "Cerrada", variant: "warning" },
};

export function rutaEvaluacion(cursoId, tipo, id) {
  return `/cursos/${cursoId}/evaluaciones/${tipo === "EXAMEN" ? "examenes" : "tareas"}/${id}`;
}

export function fechaEvaluacion(valor) {
  if (!valor) return "Sin fecha";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? "Fecha no disponible" : fecha.toLocaleString("es-CO", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function pesoTotal(evaluaciones) {
  return evaluaciones.reduce((suma, evaluacion) => suma + evaluacion.pesoPorcentual, 0);
}

export function porcentaje(valor) {
  return Number(valor.toFixed(6)).toLocaleString("es-CO", { maximumFractionDigits: 6 });
}

export function validarEvaluacion(form, tipo, pesoActual) {
  if (!form.titulo.trim()) return "El título es obligatorio.";
  const peso = Number(form.pesoPorcentual);
  if (!Number.isFinite(peso) || peso <= 0 || peso > 100) return "El peso debe ser mayor que 0 y menor o igual a 100 %.";
  if (pesoActual + peso > 100 + 1e-9) return "El peso total de las evaluaciones no puede superar el 100 %.";
  const fecha = tipo === "TAREA" ? form.fechaLimite : form.fechaAplicacion;
  if (!fecha || Number.isNaN(new Date(fecha).getTime())) return "Ingresa una fecha y hora válidas.";
  if (tipo === "EXAMEN") {
    if (!Number.isInteger(Number(form.tiempoLimite)) || Number(form.tiempoLimite) < 1) return "La duración debe ser un número entero de al menos 1 minuto.";
    if (!Number.isInteger(Number(form.numeroIntentosPermitidos)) || Number(form.numeroIntentosPermitidos) < 1) return "Los intentos permitidos deben ser un número entero de al menos 1.";
  } else if (form.permiteEntregaTardia) {
    const penalizacion = Number(form.penalizacionTardanzaPorcentaje);
    if (!Number.isFinite(penalizacion) || penalizacion < 0 || penalizacion > 100) return "La penalización debe estar entre 0 y 100 %.";
  }
  return "";
}

export function prepararEvaluacion(form, tipo) {
  const datos = { titulo: form.titulo.trim(), descripcion: form.descripcion.trim(), pesoPorcentual: Number(form.pesoPorcentual) };
  return tipo === "TAREA" ? {
    ...datos,
    instrucciones: form.instrucciones.trim(),
    fechaLimite: form.fechaLimite,
    permiteEntregaTardia: form.permiteEntregaTardia,
    penalizacionTardanzaPorcentaje: form.permiteEntregaTardia ? Number(form.penalizacionTardanzaPorcentaje) : null,
  } : {
    ...datos,
    fechaAplicacion: form.fechaAplicacion,
    tiempoLimite: Number(form.tiempoLimite),
    numeroIntentosPermitidos: Number(form.numeroIntentosPermitidos),
    aleatorio: form.aleatorio,
  };
}
