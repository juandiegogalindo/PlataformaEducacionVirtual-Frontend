export const ROLES = {
  ESTUDIANTE: "Estudiante",
  DOCENTE: "Docente",
  COORDINADOR: "CoordinadorAcademico",
  ADMINISTRADOR: "Administrador",
};

export const ROLES_GESTION_CURSOS = [ROLES.DOCENTE, ROLES.COORDINADOR, ROLES.ADMINISTRADOR];
export const ROLES_EVALUACIONES = [ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.COORDINADOR];

export function esCoordinadorOAdmin(user) {
  return user?.rol === ROLES.COORDINADOR || user?.rol === ROLES.ADMINISTRADOR;
}

export function esDocenteDelCurso(user, curso) {
  return user?.rol === ROLES.DOCENTE && curso?.docenteId === user?.id;
}

export function puedeGestionarCurso(user, curso) {
  return esCoordinadorOAdmin(user) || esDocenteDelCurso(user, curso);
}
