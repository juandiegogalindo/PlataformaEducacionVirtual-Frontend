import { useState, useEffect } from "react";
import { getPerfilRequest } from "../../api/auth";
import { actualizarPerfilRequest, cambiarContrasenaRequest } from "../../api/perfil";
import { useAuthStore } from "../../auth/authStore";

export default function Perfil() {
  const setUser = useAuthStore((state) => state.setUser);

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);

  const [datosForm, setDatosForm] = useState({ nombre: "", apellido: "", telefono: "", fotoPerfilUrl: "" });
  const [datosMsg, setDatosMsg] = useState("");
  const [datosLoading, setDatosLoading] = useState(false);

  const [passForm, setPassForm] = useState({ contrasenaActual: "", contrasenaNueva: "", confirmarContrasenaNueva: "" });
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
          fotoPerfilUrl: res.data.fotoPerfilUrl || "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDatosSubmit(e) {
    e.preventDefault();
    setDatosMsg("");
    setDatosLoading(true);
    try {
      const { data } = await actualizarPerfilRequest(datosForm);
      setPerfil(data);
      setUser(data);
      setDatosMsg("Perfil actualizado correctamente");
    } catch {
      setDatosMsg("No se pudo actualizar el perfil");
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
      setPassForm({ contrasenaActual: "", contrasenaNueva: "", confirmarContrasenaNueva: "" });
    } catch (err) {
      setPassError(err.response?.data?.mensaje || "No se pudo cambiar la contraseña");
    } finally {
      setPassLoading(false);
    }
  }

  if (loading) return <p className="text-gray-400">Cargando perfil...</p>;

  return (
    <div className="max-w-xl flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
        <p className="text-sm text-gray-500 mb-4">{perfil.correo} · {perfil.rol}</p>

        <form onSubmit={handleDatosSubmit} className="flex flex-col gap-3">
          {datosMsg && <p className="text-sm">{datosMsg}</p>}
          <input
            placeholder="Nombre"
            value={datosForm.nombre}
            onChange={(e) => setDatosForm({ ...datosForm, nombre: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            required
          />
          <input
            placeholder="Apellido"
            value={datosForm.apellido}
            onChange={(e) => setDatosForm({ ...datosForm, apellido: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            required
          />
          <input
            placeholder="Teléfono"
            value={datosForm.telefono}
            onChange={(e) => setDatosForm({ ...datosForm, telefono: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
          />
          <input
            placeholder="Link a tu foto de perfil (ej. Google Drive, Imgur)"
            value={datosForm.fotoPerfilUrl}
            onChange={(e) => setDatosForm({ ...datosForm, fotoPerfilUrl: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            />
          <button type="submit" disabled={datosLoading} className="bg-white text-black py-2 rounded font-semibold">
            {datosLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold mb-3">Cambiar contraseña</h2>
        <form onSubmit={handlePassSubmit} className="flex flex-col gap-3">
          {passMsg && <p className="text-sm text-green-400">{passMsg}</p>}
          {passError && <p className="text-sm text-red-500">{passError}</p>}
          <input
            type="password"
            placeholder="Contraseña actual"
            value={passForm.contrasenaActual}
            onChange={(e) => setPassForm({ ...passForm, contrasenaActual: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Contraseña nueva"
            value={passForm.contrasenaNueva}
            onChange={(e) => setPassForm({ ...passForm, contrasenaNueva: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña nueva"
            value={passForm.confirmarContrasenaNueva}
            onChange={(e) => setPassForm({ ...passForm, confirmarContrasenaNueva: e.target.value })}
            className="p-2 rounded bg-gray-900 border border-gray-700"
            required
          />
          <button type="submit" disabled={passLoading} className="bg-white text-black py-2 rounded font-semibold">
            {passLoading ? "Cambiando..." : "Cambiar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}