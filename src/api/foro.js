import api from "./axiosInstance";

const base = (cursoId) => `/api/cursos/${cursoId}/foro/mensajes`;

export const listarMensajes = (cursoId) => api.get(base(cursoId));

export const publicarMensaje = (cursoId, contenido, mensajePadreId) =>
  api.post(base(cursoId), mensajePadreId ? { contenido, mensajePadreId } : { contenido });

export const editarMensaje = (cursoId, mensajeId, contenido) =>
  api.put(`${base(cursoId)}/${mensajeId}`, { contenido });

export const eliminarMensaje = (cursoId, mensajeId) =>
  api.delete(`${base(cursoId)}/${mensajeId}`);