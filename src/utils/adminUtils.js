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

export function validarUsuario(tipo, form) {
  if (!TIPOS_USUARIO.some((opcion) => opcion.value === tipo)) {
    return `Tipo de usuario no válido: ${tipo}.`;
  }
  const campos = tipo === "docentes"
    ? ["nombre", "apellido", "correo", "codigoDocente", "especialidad", "tituloProfesional"]
    : ["nombre", "apellido", "correo", "codigo", tipo === "coordinadores" ? "facultad" : "cargo"];
  const faltante = campos.find((campo) => !String(form[campo] ?? "").trim());
  if (faltante) return `El campo ${faltante} es obligatorio y no puede contener solo espacios.`;
  if (tipo === "docentes" && String(form.aniosExperiencia ?? "").trim() !== "") {
    const experiencia = Number(form.aniosExperiencia);
    if (!Number.isInteger(experiencia) || experiencia < 0) {
      return "Los años de experiencia deben ser un número entero igual o mayor que cero.";
    }
  }
  return "";
}

export function prepararUsuario(tipo, form) {
  const error = validarUsuario(tipo, form);
  if (error) throw new Error(error);
  const datos = {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    correo: form.correo.trim(),
    contrasena: form.contrasena,
  };

  if (tipo === "docentes") {
    const experiencia = String(form.aniosExperiencia ?? "").trim();
    return {
      ...datos,
      codigoDocente: form.codigoDocente.trim(),
      especialidad: form.especialidad.trim(),
      tituloProfesional: form.tituloProfesional.trim(),
      aniosExperiencia: experiencia === "" ? null : Number(experiencia),
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
