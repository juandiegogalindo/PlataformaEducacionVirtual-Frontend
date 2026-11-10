export const TIPOS_USUARIO = [
  { value: "docentes", label: "Docente" },
  { value: "coordinadores", label: "Coordinador académico" },
  { value: "administradores", label: "Administrador" },
];

export function nombreRol(rol) {
  return rol === "CoordinadorAcademico" || rol === "Coordinador"
    ? "Coordinador académico"
    : rol;
}

export function prepararUsuario(tipo, form) {
  const datos = {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    correo: form.correo.trim(),
    contrasena: form.contrasena,
  };

  if (tipo === "docentes") {
    return {
      ...datos,
      codigoDocente: form.codigoDocente.trim(),
      especialidad: form.especialidad.trim(),
      tituloProfesional: form.tituloProfesional.trim(),
      aniosExperiencia: form.aniosExperiencia === "" ? null : Number(form.aniosExperiencia),
      biografia: form.biografia.trim(),
    };
  }
  if (tipo === "coordinadores") {
    return {
      ...datos,
      codigo: form.codigo.trim(),
      facultad: form.facultad.trim(),
      telefonoOficina: form.telefonoOficina.trim(),
    };
  }
  return { ...datos, codigo: form.codigo.trim(), cargo: form.cargo.trim(), nivelAcceso: form.nivelAcceso };
}
