import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { verCursoRequest, crearCursoRequest, actualizarCursoRequest } from "../../api/cursos";
import { useAuthStore } from "../../auth/authStore";
import { puedeGestionarCurso } from "../../auth/roles";

const formVacio = { nombre: "", descripcion: "", fechaInicio: "", fechaFin: "", cupoMaximo: "" };

export default function CursoForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [form, setForm] = useState(formVacio);
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(esEdicion);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!esEdicion) return;
    verCursoRequest(id)
      .then((res) => {
        setCurso(res.data);
        setForm({
          nombre: res.data.nombre,
          descripcion: res.data.descripcion || "",
          fechaInicio: res.data.fechaInicio,
          fechaFin: res.data.fechaFin,
          cupoMaximo: String(res.data.cupoMaximo),
        });
      })
      .catch(() => setError("No se pudo cargar el curso"))
      .finally(() => setLoading(false));
  }, [id, esEdicion]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (Number(form.cupoMaximo) < 1) return "El cupo máximo debe ser al menos 1";
    if (form.fechaFin < form.fechaInicio) return "La fecha de fin no puede ser anterior a la de inicio";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }

    const datos = { ...form, cupoMaximo: Number(form.cupoMaximo) };
    setSaving(true);
    try {
      if (esEdicion) {
        await actualizarCursoRequest(id, datos);
        navigate(`/cursos/${id}`);
      } else {
        const { data } = await crearCursoRequest(datos);
        navigate(data?.id ? `/cursos/${data.id}` : "/cursos");
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar el curso");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-400">Cargando curso...</p>;
  if (esEdicion && !curso) return <p className="text-red-500">{error || "No se pudo cargar el curso"}</p>;
  if (esEdicion && !puedeGestionarCurso(user, curso)) {
    return <p className="text-red-500">No tienes permiso para editar este curso</p>;
  }

  return (
    <div className="max-w-xl">
      <Link to={esEdicion ? `/cursos/${id}` : "/cursos"} className="text-sm text-gray-500 hover:underline">
        &larr; Cancelar
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-4">{esEdicion ? "Editar curso" : "Nuevo curso"}</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea name="descripcion" rows="3" value={form.descripcion} onChange={handleChange} className="border border-gray-300 rounded p-2" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Fecha de inicio
            <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Fecha de fin
            <input type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Cupo máximo
          <input type="number" min="1" name="cupoMaximo" value={form.cupoMaximo} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
        </label>

        <button type="submit" disabled={saving} className="bg-black text-white py-2 rounded font-semibold">
          {saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear curso"}
        </button>
      </form>
    </div>
  );
}