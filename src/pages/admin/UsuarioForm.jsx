import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearUsuarioRequest } from "../../api/admin";
import { prepararUsuario, TIPOS_USUARIO } from "./adminUtils";
import { mensajeError } from "../../utils/errores";
import Input, { Select, Textarea } from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";

const formInicial = {
  nombre: "", apellido: "", correo: "", contrasena: "", confirmacion: "",
  codigoDocente: "", especialidad: "", tituloProfesional: "", aniosExperiencia: "", biografia: "",
  codigo: "", facultad: "", telefonoOficina: "", cargo: "", nivelAcceso: "ADMIN",
};

export default function UsuarioForm() {
  const [tipo, setTipo] = useState("docentes");
  const [form, setForm] = useState(formInicial);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);
  const navigate = useNavigate();

  function cambiarCampo(event) {
    setForm((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  }

  async function registrar(event) {
    event.preventDefault();
    if (enviando.current) return;
    setError("");
    const datos = prepararUsuario(tipo, form);
    const obligatorios = tipo === "docentes"
      ? ["nombre", "apellido", "correo", "codigoDocente", "especialidad", "tituloProfesional"]
      : ["nombre", "apellido", "correo", "codigo", tipo === "coordinadores" ? "facultad" : "cargo"];
    if (obligatorios.some((campo) => !datos[campo])) {
      setError("Completa todos los campos obligatorios; no pueden contener solo espacios.");
      return;
    }
    if (form.contrasena.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (form.contrasena !== form.confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (tipo === "docentes" && datos.aniosExperiencia !== null
      && (!Number.isInteger(datos.aniosExperiencia) || datos.aniosExperiencia < 0)) {
      setError("Los años de experiencia deben ser un número entero igual o mayor que cero.");
      return;
    }
    enviando.current = true;
    setGuardando(true);
    try {
      const { data } = await crearUsuarioRequest(tipo, datos);
      navigate("/admin/usuarios", { replace: true, state: { mensaje: `La cuenta de ${data.nombre} ${data.apellido} se creó correctamente.` } });
    } catch (err) {
      setError(mensajeError(err, "No se pudo registrar el usuario."));
    } finally {
      enviando.current = false;
      setGuardando(false);
    }
  }

  function campo(name, label, opciones = {}) {
    return <Input key={name} label={label} name={name} value={form[name]} onChange={cambiarCampo} {...opciones} />;
  }

  return (
    <>
      <Link to="/admin/usuarios" className="admin-back">← Volver a usuarios</Link>
      <div className="admin-page-heading"><div><h1>Registrar usuario</h1>
        <p className="admin-muted">Crea una cuenta y completa los datos correspondientes a su rol.</p></div></div>
      <form className="admin-card admin-form" onSubmit={registrar} aria-label="Registrar usuario">
        {error && <Alert variant="error" title={error} className="mb-5" />}
        <fieldset disabled={guardando}>
          <legend>Datos de la cuenta</legend>
          <p className="admin-muted admin-field-hint">Los campos marcados con * son obligatorios.</p>
          <div className="admin-form-grid">
            <Select label="Rol" required aria-label="Rol *" value={tipo} onChange={(event) => { setTipo(event.target.value); setError(""); }}>
                {TIPOS_USUARIO.map((opcion) => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}
            </Select>
            <div className="admin-form-spacer" />
            {campo("nombre", "Nombre", { required: true, autoComplete: "given-name" })}
            {campo("apellido", "Apellido", { required: true, autoComplete: "family-name" })}
            {campo("correo", "Correo electrónico", { required: true, type: "email", autoComplete: "off" })}
            <div className="admin-form-spacer" />
            {campo("contrasena", "Contraseña", { required: true, type: "password", minLength: 8, autoComplete: "new-password", "aria-describedby": "ayuda-contrasena" })}
            {campo("confirmacion", "Confirmar contraseña", { required: true, type: "password", minLength: 8, autoComplete: "new-password" })}
          </div>
          <p className="admin-muted admin-field-hint" id="ayuda-contrasena">Usa al menos 8 caracteres para la contraseña.</p>
        </fieldset>
        <fieldset disabled={guardando}>
          <legend>Información del {TIPOS_USUARIO.find((opcion) => opcion.value === tipo).label.toLowerCase()}</legend>
          <div className="admin-form-grid">
            {tipo === "docentes" && <>
              {campo("codigoDocente", "Código de docente", { required: true })}
              {campo("especialidad", "Especialidad", { required: true })}
              {campo("tituloProfesional", "Título profesional", { required: true })}
              {campo("aniosExperiencia", "Años de experiencia", { type: "number", min: 0, step: 1 })}
              <Textarea label="Biografía" className="admin-field-wide" name="biografia" value={form.biografia} onChange={cambiarCampo} rows={4} />
            </>}
            {tipo === "coordinadores" && <>
              {campo("codigo", "Código de coordinador", { required: true })}
              {campo("facultad", "Facultad", { required: true })}
              {campo("telefonoOficina", "Teléfono de oficina", { type: "tel" })}
            </>}
            {tipo === "administradores" && <>
              {campo("codigo", "Código de administrador", { required: true })}
              {campo("cargo", "Cargo", { required: true })}
              <Select label="Nivel de acceso" aria-label="Nivel de acceso" name="nivelAcceso" value={form.nivelAcceso} onChange={cambiarCampo}>
                  <option value="ADMIN">Administrador</option><option value="SUPER_ADMIN">Superadministrador</option>
              </Select>
            </>}
          </div>
        </fieldset>
        <div className="admin-actions">
          {!guardando && <Link to="/admin/usuarios" className="admin-button admin-button-secondary">Cancelar</Link>}
          <button type="submit" className="admin-button admin-button-primary" disabled={guardando}>{guardando ? "Registrando…" : "Registrar usuario"}</button>
        </div>
      </form>
    </>
  );
}
