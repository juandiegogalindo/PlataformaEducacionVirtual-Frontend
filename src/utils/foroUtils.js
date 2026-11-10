export const limpiarRol = (rol = "") => rol.split("$")[0];

export const iniciales = (nombre = "") =>
  nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");

export function tiempoRelativo(fechaIso) {
  const seg = Math.max(0, (Date.now() - new Date(fechaIso).getTime()) / 1000);
  if (seg < 60) return "Hace un momento";
  const min = Math.floor(seg / 60);
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Ayer";
  if (d < 7) return `Hace ${d} días`;
  const s = Math.floor(d / 7);
  return s === 1 ? "Hace 1 semana" : `Hace ${s} semanas`;
}

export const tituloDe = (contenido = "") => {
  const linea = contenido.split("\n")[0].trim();
  return linea.length > 90 ? `${linea.slice(0, 90)}…` : linea;
};

export const contarRespuestas = (m) =>
  (m.respuestas || []).reduce((acc, r) => acc + 1 + contarRespuestas(r), 0);

export const buscarMensaje = (arbol, id) => {
  for (const m of arbol) {
    if (m.id === id) return m;
    const hijo = buscarMensaje(m.respuestas || [], id);
    if (hijo) return hijo;
  }
  return null;
};

export const nombreCompleto = (u) =>
  u ? [u.nombre, u.apellido].filter(Boolean).join(" ") || u.nombreCompleto || "" : "";

export const esMio = (m, user) =>
  m.autorId != null ? m.autorId === user?.id : m.autorNombre === nombreCompleto(user);

export const esDocente = (user) => (user?.rol || "").toLowerCase().includes("docente");

export const puedeEditar = (m, user) => esMio(m, user) || esDocente(user);
export const puedeEliminar = (m, user) => esMio(m, user);