import { useState, useEffect } from "react";
import { Camera, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Phone, Save, ShieldCheck, Trash2 } from "lucide-react";
import { getPerfilRequest } from "../../api/auth";
import {
  actualizarPerfilRequest,
  cambiarContrasenaRequest,
  subirFotoRequest,
  eliminarFotoRequest,
} from "../../api/perfil";
import { useAuthStore } from "../../auth/authStore";
import Avatar from "../../components/Avatar";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { reducirImagen } from "../../utils/imagenes";
import { mensajeError } from "../../utils/errores";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024;
const passVacia = { contrasenaActual: "", contrasenaNueva: "", confirmarContrasenaNueva: "" };

// Medidor orientativo (la validación real la hace el backend)
function puntosFortaleza(pass) {
  let puntos = 0;
  if (pass.length >= 8) puntos++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) puntos++;
  if (/\d/.test(pass)) puntos++;
  if (/[^A-Za-z0-9]/.test(pass)) puntos++;
  return puntos;
}

const NIVELES = [
  { label: "Débil", color: "bg-red-500", texto: "text-red-600" },
  { label: "Débil", color: "bg-red-500", texto: "text-red-600" },
  { label: "Regular", color: "bg-amber-500", texto: "text-amber-600" },
  { label: "Buena", color: "bg-emerald-400", texto: "text-emerald-600" },
  { label: "Fuerte", color: "bg-emerald-600", texto: "text-emerald-700" },
];

function MedidorFortaleza({ pass }) {
  if (!pass) return null;
  const puntos = puntosFortaleza(pass);
  const nivel = NIVELES[puntos];
  const llenos = Math.max(puntos, 1);
  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full ${n <= llenos ? nivel.color : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className={`mt-1 text-[11px] font-semibold ${nivel.texto}`}>Fortaleza: {nivel.label}</p>
      <p className="text-[11px] text-slate-400">Usa 8 o más caracteres, mayúsculas, números y símbolos.</p>
    </div>
  );
}

function Tarjeta({ icono: Icono, titulo, subtitulo, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-primary">
          <Icono size={16} />
        </span>
        <div className="leading-tight">
          <h2 className="text-sm font-semibold">{titulo}</h2>
          <p className="text-[11px] text-slate-400">{subtitulo}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function DatoLectura({ etiqueta, valor }) {
  if (valor === undefined || valor === null || valor === "") return null;
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{etiqueta}</p>
      <p className="text-xs font-semibold">{valor}</p>
    </div>
  );
}

export default function Perfil() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fotoLoading, setFotoLoading] = useState(false);
  const [fotoMsg, setFotoMsg] = useState("");
  const [fotoError, setFotoError] = useState("");

  const [datosForm, setDatosForm] = useState({ nombre: "", apellido: "", telefono: "" });
  const [datosAlerta, setDatosAlerta] = useState(null); // { variant, texto }
  const [datosLoading, setDatosLoading] = useState(false);

  const [passForm, setPassForm] = useState(passVacia);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [passError, setPassError] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    getPerfilRequest()
      .then((res) => {
        setPerfil(res.data);
        setDatosForm({
          nombre: res.data.nombre || "",
          apellido: res.data.apellido || "",
          telefono: res.data.telefono || "",
        });
      })
      .catch((err) => setError(mensajeError(err, "No se pudo cargar tu perfil")))
      .finally(() => setLoading(false));
  }, []);

  async function refrescarPerfil() {
    const { data } = await getPerfilRequest();
    setPerfil(data);
    setUser(data);
  }

  async function handleFotoSeleccionada(e) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setFotoMsg("");
    setFotoError("");

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setFotoError("Formato no permitido. Usa una imagen JPEG, PNG o WebP.");
      return;
    }
    if (archivo.size > MAX_ORIGINAL_BYTES) {
      setFotoError("La imagen es demasiado grande. Elige una de menos de 15 MB.");
      return;
    }

    setFotoLoading(true);
    try {
      let reducida;
      try {
        reducida = await reducirImagen(archivo);
      } catch {
        setFotoError("No se pudo leer la imagen. Prueba con otro archivo.");
        return;
      }
      if (reducida.size > MAX_BYTES) {
        setFotoError("La foto pesa más de 5 MB incluso reducida. Prueba con otra imagen.");
        return;
      }

      await subirFotoRequest(reducida);
      await refrescarPerfil();
      setFotoMsg("Foto actualizada");
    } catch (err) {
      setFotoError(mensajeError(err, "No se pudo subir la foto"));
    } finally {
      setFotoLoading(false);
    }
  }

  async function handleQuitarFoto() {
    if (!window.confirm("¿Quitar tu foto de perfil?")) return;
    setFotoMsg("");
    setFotoError("");
    setFotoLoading(true);
    try {
      await eliminarFotoRequest();
      await refrescarPerfil();
      setFotoMsg("Foto eliminada");
    } catch (err) {
      setFotoError(mensajeError(err, "No se pudo eliminar la foto"));
    } finally {
      setFotoLoading(false);
    }
  }

  async function handleDatosSubmit(e) {
    e.preventDefault();
    setDatosAlerta(null);
    setDatosLoading(true);
    try {
      const { data } = await actualizarPerfilRequest(datosForm);
      setPerfil(data);
      setUser(data);
      setDatosAlerta({ variant: "success", texto: "Perfil actualizado correctamente" });
    } catch (err) {
      setDatosAlerta({ variant: "error", texto: mensajeError(err, "No se pudo actualizar el perfil") });
    } finally {
      setDatosLoading(false);
    }
  }

  async function handlePassSubmit(e) {
    e.preventDefault();
    setPassMsg("");
    setPassError("");

    if (passForm.contrasenaNueva !== passForm.confirmarContrasenaNueva) {
      setPassError("La confirmación no coincide con la contraseña nueva");
      return;
    }

    setPassLoading(true);
    try {
      await cambiarContrasenaRequest(passForm);
      setPassMsg("Contraseña actualizada correctamente");
      setPassForm(passVacia);
    } catch (err) {
      setPassError(mensajeError(err, "No se pudo cambiar la contraseña"));
    } finally {
      setPassLoading(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando perfil...</p>;
  if (error || !perfil) {
    return <Alert variant="error" title="No se pudo cargar tu perfil">{error}</Alert>;
  }

  const hayCambios =
    datosForm.nombre !== (perfil.nombre || "") ||
    datosForm.apellido !== (perfil.apellido || "") ||
    datosForm.telefono !== (perfil.telefono || "");

  const noCoincide =
    passForm.confirmarContrasenaNueva !== "" &&
    passForm.contrasenaNueva !== passForm.confirmarContrasenaNueva;

  const tipoCampo = mostrarPass ? "text" : "password";
  const nombreCompleto = `${perfil.nombre || ""} ${perfil.apellido || ""}`.trim();

  return (
    <div className="max-w-5xl">
      {/* Cabecera con portada y foto */}
      <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="relative h-28 overflow-hidden bg-linear-to-r from-primary via-blue-600 to-sidebar">
          <span className="absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/10" />
          <span className="absolute right-32 top-10 h-32 w-32 rounded-full bg-white/5" />
          <span className="absolute -left-8 -bottom-16 h-40 w-40 rounded-full bg-white/10" />
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-wrap items-end gap-4">
            <div className="relative">
              <Avatar usuario={user ?? perfil} tamano={112} className="ring-4 ring-white" />
              <label
                htmlFor="foto-perfil"
                title="Cambiar foto"
                className={`absolute bottom-1 right-1 grid h-8 w-8 cursor-pointer place-items-center rounded-full bg-primary text-white ring-2 ring-white hover:bg-primary-dark ${
                  fotoLoading ? "pointer-events-none opacity-70" : ""
                }`}
              >
                {fotoLoading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              </label>
              <input
                id="foto-perfil"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoSeleccionada}
                disabled={fotoLoading}
                className="sr-only"
              />
            </div>

            <div className="flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold">{nombreCompleto}</h1>
                <Badge variant="info">
                  <span className="capitalize">{perfil.rol?.toLowerCase()}</span>
                </Badge>
              </div>
              <p className="flex items-center gap-1.5 text-xs text-slate-500">
                <Mail size={12} />
                {perfil.correo}
              </p>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <label
                htmlFor="foto-perfil"
                className={`cursor-pointer rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 ${
                  fotoLoading ? "pointer-events-none opacity-50" : ""
                }`}
              >
                {fotoLoading ? "Procesando..." : "Cambiar foto"}
              </label>
              {perfil.fotoPerfilUrl && (
                <button
                  onClick={handleQuitarFoto}
                  disabled={fotoLoading}
                  className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            JPEG, PNG o WebP. Se reduce a 512 px antes de subirla.
          </p>
        </div>
      </section>

      {fotoMsg && <Alert variant="success" title={fotoMsg} className="mb-4" />}
      {fotoError && <Alert variant="error" title={fotoError} className="mb-4" />}

      <div className="grid items-start gap-4 lg:grid-cols-[3fr_2fr]">
        {/* Mis datos */}
        <Tarjeta icono={ShieldCheck} titulo="Mis datos" subtitulo="Información personal de tu cuenta.">
          {datosAlerta && <Alert variant={datosAlerta.variant} title={datosAlerta.texto} className="mb-4" />}

          <form onSubmit={handleDatosSubmit} className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Nombre"
                value={datosForm.nombre}
                onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })}
                required
              />
              <Input
                label="Apellido"
                value={datosForm.apellido}
                onChange={(e) => setDatosForm({ ...datosForm, apellido: e.target.value })}
                required
              />
            </div>

            <Input label="Correo electrónico" icon={Mail} value={perfil.correo || ""} disabled readOnly />

            <Input
              label="Teléfono"
              icon={Phone}
              type="tel"
              placeholder="Opcional"
              value={datosForm.telefono}
              onChange={(e) => setDatosForm({ ...datosForm, telefono: e.target.value })}
            />

            {(perfil.codigoEstudiantil || perfil.programaAcademico || perfil.semestre) && (
              <div>
                <p className="mb-2 text-[11px] font-semibold">Información académica</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  <DatoLectura etiqueta="Código" valor={perfil.codigoEstudiantil} />
                  <DatoLectura etiqueta="Programa" valor={perfil.programaAcademico} />
                  <DatoLectura etiqueta="Semestre" valor={perfil.semestre} />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              {!hayCambios && <span className="text-[11px] text-slate-400">No hay cambios por guardar</span>}
              <button
                type="submit"
                disabled={datosLoading || !hayCambios}
                className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/40"
              >
                {datosLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {datosLoading ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Tarjeta>

        {/* Seguridad */}
        <Tarjeta icono={KeyRound} titulo="Seguridad" subtitulo="Cambia tu contraseña de acceso.">
          {passMsg && <Alert variant="success" title={passMsg} className="mb-4" />}
          {passError && <Alert variant="error" title={passError} className="mb-4" />}

          <form onSubmit={handlePassSubmit} className="flex flex-col gap-4">
            <Input
              label="Contraseña actual"
              icon={Lock}
              type={tipoCampo}
              autoComplete="current-password"
              value={passForm.contrasenaActual}
              onChange={(e) => setPassForm({ ...passForm, contrasenaActual: e.target.value })}
              required
            />

            <div className="flex flex-col gap-2">
              <Input
                label="Contraseña nueva"
                icon={Lock}
                type={tipoCampo}
                autoComplete="new-password"
                value={passForm.contrasenaNueva}
                onChange={(e) => setPassForm({ ...passForm, contrasenaNueva: e.target.value })}
                required
              />
              <MedidorFortaleza pass={passForm.contrasenaNueva} />
            </div>

            <Input
              label="Confirmar contraseña nueva"
              icon={Lock}
              type={tipoCampo}
              autoComplete="new-password"
              value={passForm.confirmarContrasenaNueva}
              onChange={(e) => setPassForm({ ...passForm, confirmarContrasenaNueva: e.target.value })}
              error={noCoincide ? "Las contraseñas no coinciden" : undefined}
              required
            />

            <button
              type="button"
              onClick={() => setMostrarPass((v) => !v)}
              className="flex items-center gap-1.5 self-start text-[11px] font-semibold text-slate-500 hover:text-primary"
            >
              {mostrarPass ? <EyeOff size={14} /> : <Eye size={14} />}
              {mostrarPass ? "Ocultar contraseñas" : "Mostrar contraseñas"}
            </button>

            <button
              type="submit"
              disabled={passLoading || noCoincide}
              className="flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/40"
            >
              {passLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              {passLoading ? "Cambiando..." : "Cambiar contraseña"}
            </button>
          </form>
        </Tarjeta>
      </div>
    </div>
  );
}