export const DIAS_SEMANA = [
  { valor: "LUNES", etiqueta: "Lunes" },
  { valor: "MARTES", etiqueta: "Martes" },
  { valor: "MIERCOLES", etiqueta: "Miércoles" },
  { valor: "JUEVES", etiqueta: "Jueves" },
  { valor: "VIERNES", etiqueta: "Viernes" },
  { valor: "SABADO", etiqueta: "Sábado" },
  { valor: "DOMINGO", etiqueta: "Domingo" },
];

export function etiquetaDia(valor) {
  return DIAS_SEMANA.find((d) => d.valor === valor)?.etiqueta ?? valor;
}

// El backend manda "08:00:00"; los inputs de hora y la pantalla usan "08:00"
export function recortarHora(hora) {
  return hora ? hora.slice(0, 5) : "";
}

export function textoSesion(sesion) {
  return `${etiquetaDia(sesion.diaSemana)} ${recortarHora(sesion.horaInicio)}–${recortarHora(sesion.horaFin)}`;
}

function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function validarHorarios(horarios) {
  if (horarios.length === 0) return "Agrega al menos una sesión";

  for (const sesion of horarios) {
    if (!sesion.horaInicio || !sesion.horaFin) {
      return "Completa la hora de inicio y de fin de cada sesión";
    }
    if (aMinutos(sesion.horaInicio) >= aMinutos(sesion.horaFin)) {
      return "En cada sesión, la hora de inicio debe ser anterior a la de fin";
    }
  }

  for (let i = 0; i < horarios.length; i++) {
    for (let j = i + 1; j < horarios.length; j++) {
      const a = horarios[i];
      const b = horarios[j];
      const seCruzan =
        a.diaSemana === b.diaSemana &&
        aMinutos(a.horaInicio) < aMinutos(b.horaFin) &&
        aMinutos(b.horaInicio) < aMinutos(a.horaFin);
      if (seCruzan) {
        return `Dos sesiones del ${etiquetaDia(a.diaSemana).toLowerCase()} se cruzan entre sí`;
      }
    }
  }

  return "";
}