export const ROLES = {
  ESTUDIANTE: "Estudiante",
  DOCENTE: "Docente",
  COORDINADOR: "Coordinador",
  ADMINISTRADOR: "Administrador",
};

export const ROLES_GESTION_CURSOS = [ROLES.DOCENTE, ROLES.COORDINADOR, ROLES.ADMINISTRADOR];

export function puedeGestionarCurso(user, curso) {
  if (!user || !curso) return false;
  if (user.rol === ROLES.COORDINADOR || user.rol === ROLES.ADMINISTRADOR) return true;
  return user.rol === ROLES.DOCENTE && curso.docenteCorreo === user.correo;
}