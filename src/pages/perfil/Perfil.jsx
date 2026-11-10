import { useState, useEffect } from "react";
import { getPerfilRequest } from "../../api/auth";
import {
  actualizarPerfilRequest,
  cambiarContrasenaRequest,
  subirFotoRequest,
  eliminarFotoRequest,
} from "../../api/perfil";
import { useAuthStore } from "../../auth/authStore";
import Avatar from "../../components/Avatar";
import { reducirImagen } from "../../utils/imagenes";
import { mensajeError } from "../../utils/errores";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; 
const MAX_ORIGINAL_BYTES = 15 * 1024 * 1024; 
const passVacia = { contrasenaActual: "", contrasenaNueva: "", confirmarContrasenaNueva: "" };

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
  const [datosMsg, setDatosMsg] = useState("");
  const [datosLoading, setDatosLoading] = useState(false);

  const [passForm, setPassForm] = useState(passVacia);
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
    setDatosMsg("");
    setDatosLoading(true);
    try {
      const { data } = await actualizarPerfilRequest(datosForm);
      setPerfil(data);
      setUser(data);
      setDatosMsg("Perfil actualizado correctamente");
    } catch (err) {
      setDatosMsg(mensajeError(err, "No se pudo actualizar el perfil"));
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

  if (loading) return <p className="text-gray-400">Cargando perfil...</p>;
  if (error || !perfil) return <p className="text-red-500">{error || "No se pudo cargar tu perfil"}</p>;

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
        <p className="text-sm text-gray-500">{perfil.correo} · {perfil.rol}</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar usuario={user} tamano={96} />
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <label
              className={`bg-black text-white px-3 py-2 rounded text-sm font-semibold cursor-pointer ${
                fotoLoading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {fotoLoading ? "Procesando..." : "Cambiar foto"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFotoSeleccionada}
                disabled={fotoLoading}
                className="hidden"
              />
            </label>
            {perfil.fotoPerfilUrl && (
              <button
                onClick={handleQuitarFoto}
                disabled={fotoLoading}
                className="border border-red-700 text-red-700 px-3 py-2 rounded text-sm"
              >
                Quitar foto
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">JPEG, PNG o WebP. Se reduce a 512 px antes de subirla.</p>
          {fotoMsg && <p className="text-sm text-green-700">{fotoMsg}</p>}
          {fotoError && <p className="text-sm text-red-500">{fotoError}</p>}
        </div>
      </div>

      <form onSubmit={handleDatosSubmit} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Mis datos</h2>
        {datosMsg && <p className="text-sm">{datosMsg}</p>}

        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            value={datosForm.nombre}
            onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })}
            className="border border-gray-300 rounded p-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Apellido
          <input
            value={datosForm.apellido}
            onChange={(e) => setDatosForm({ ...datosForm, apellido: e.target.value })}
            className="border border-gray-300 rounded p-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Teléfono
          <input
            value={datosForm.telefono}
            onChange={(e) => setDatosForm({ ...datosForm, telefono: e.target.value })}
            className="border border-gray-300 rounded p-2"
          />
        </label>

        <button type="submit" disabled={datosLoading} className="bg-black text-white py-2 rounded font-semibold">
          {datosLoading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      <form onSubmit={handlePassSubmit} className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Cambiar contraseña</h2>
        {passMsg && <p className="text-sm text-green-700">{passMsg}</p>}
        {passError && <p className="text-sm text-red-500">{passError}</p>}

        <label className="flex flex-col gap-1 text-sm">
          Contraseña actual
          <input
            type="password"
            value={passForm.contrasenaActual}
            onChange={(e) => setPassForm({ ...passForm, contrasenaActual: e.target.value })}
            className="border border-gray-300 rounded p-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña nueva
          <input
            type="password"
            value={passForm.contrasenaNueva}
            onChange={(e) => setPassForm({ ...passForm, contrasenaNueva: e.target.value })}
            className="border border-gray-300 rounded p-2"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confirmar contraseña nueva
          <input
            type="password"
            value={passForm.confirmarContrasenaNueva}
            onChange={(e) => setPassForm({ ...passForm, confirmarContrasenaNueva: e.target.value })}
            className="border border-gray-300 rounded p-2"
            required
          />
        </label>

        <button type="submit" disabled={passLoading} className="bg-black text-white py-2 rounded font-semibold">
          {passLoading ? "Cambiando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}