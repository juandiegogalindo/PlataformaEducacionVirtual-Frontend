export const ESTADOS_RESULTADO = {
  PENDIENTE: { label: "Pendiente de calificar", variant: "warning" },
  CALIFICADO: { label: "Calificado", variant: "success" },
};

export function notaResultado(nota) {
  return nota == null ? "Sin calificar" : `${nota.toLocaleString("es-CO", { maximumFractionDigits: 2 })} / 5`;
}

export function resultadosEvaluacion(resultados, evaluacionId, cursoId) {
  return resultados.filter((resultado) => String(resultado.evaluacionId) === String(evaluacionId)
    && String(resultado.cursoId) === String(cursoId))
    .sort((a, b) => b.numeroIntento - a.numeroIntento);
}

export function restriccionEntrega(evaluacion, tipo, resultados) {
  if (evaluacion.estado !== "PUBLICADA") return "Esta evaluación no admite entregas ni nuevos intentos.";
  if (tipo === "tareas" && resultados.length) return "Ya registraste la entrega de esta tarea. Solo se permite una entrega.";
  if (tipo === "examenes" && resultados.length >= evaluacion.numeroIntentosPermitidos) return "Ya usaste todos los intentos permitidos para este examen.";
  return "";
}

export function validarContenido(contenido, tipo) {
  return tipo === "tareas" && !contenido.trim() ? "Escribe el contenido de la entrega." : "";
}

export function validarCalificacion(valor) {
  if (String(valor).trim() === "") return "Ingresa una calificación.";
  const nota = Number(valor);
  return !Number.isFinite(nota) || nota < 0 || nota > 5 ? "La calificación debe estar entre 0 y 5." : "";
}
