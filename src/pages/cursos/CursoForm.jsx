import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { verCursoRequest, crearCursoRequest, actualizarCursoRequest } from "../../api/cursos";
import { listarDocentesRequest } from "../../api/docentes";
import { useAuthStore } from "../../auth/authStore";
import { puedeGestionarCurso, esCoordinadorOAdmin } from "../../auth/roles";
import { DIAS_SEMANA, recortarHora, validarHorarios } from "../../utils/horarios";
import { mensajeError } from "../../utils/errores";

function nuevaSesion(datos = {}) {
  return {
    uid: crypto.randomUUID(),
    diaSemana: datos.diaSemana || "LUNES",
    horaInicio: recortarHora(datos.horaInicio),
    horaFin: recortarHora(datos.horaFin),
  };
}

function formVacio() {
  return {
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    cupoMaximo: "",
    docenteId: "",
    horarios: [nuevaSesion()],
  };
}

export default function CursoForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const eligeDocente = esCoordinadorOAdmin(user);

  const [form, setForm] = useState(formVacio);
  const [curso, setCurso] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(esEdicion || eligeDocente);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!esEdicion && !eligeDocente) return;

    const cursoPromise = esEdicion ? verCursoRequest(id) : Promise.resolve(null);
    const docentesPromise = eligeDocente ? listarDocentesRequest() : Promise.resolve({ data: [] });

    Promise.all([cursoPromise, docentesPromise])
      .then(([cursoRes, docentesRes]) => {
        setDocentes(docentesRes.data);
        if (cursoRes) {
          const c = cursoRes.data;
          setCurso(c);
          setForm({
            nombre: c.nombre,
            descripcion: c.descripcion || "",
            fechaInicio: c.fechaInicio,
            fechaFin: c.fechaFin,
            cupoMaximo: String(c.cupoMaximo),
            docenteId: c.docenteId != null ? String(c.docenteId) : "",
            horarios: c.horarios?.length ? c.horarios.map((h) => nuevaSesion(h)) : [nuevaSesion()],
          });
        }
      })
      .catch((err) => setError(mensajeError(err, "No se pudo cargar el formulario")))
      .finally(() => setLoading(false));
  }, [id, esEdicion, eligeDocente]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function cambiarSesion(uid, campo, valor) {
    setForm({
      ...form,
      horarios: form.horarios.map((s) => (s.uid === uid ? { ...s, [campo]: valor } : s)),
    });
  }

  function agregarSesion() {
    setForm({ ...form, horarios: [...form.horarios, nuevaSesion()] });
  }

  function quitarSesion(uid) {
    setForm({ ...form, horarios: form.horarios.filter((s) => s.uid !== uid) });
  }

  function validar() {
    if (!form.nombre.trim()) return "El nombre es obligatorio";
    if (Number(form.cupoMaximo) < 1) return "El cupo máximo debe ser al menos 1";
    if (form.fechaFin < form.fechaInicio) return "La fecha de fin no puede ser anterior a la de inicio";
    if (eligeDocente && !form.docenteId) return "Selecciona el docente del curso";
    return validarHorarios(form.horarios);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const mensaje = validar();
    if (mensaje) {
      setError(mensaje);
      return;
    }

    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      cupoMaximo: Number(form.cupoMaximo),
      horarios: form.horarios.map(({ diaSemana, horaInicio, horaFin }) => ({
        diaSemana,
        horaInicio,
        horaFin,
      })),
    };
    if (eligeDocente) datos.docenteId = Number(form.docenteId);

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
      setError(mensajeError(err, "No se pudo guardar el curso"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-gray-400">Cargando formulario...</p>;
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
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Descripción
          <textarea name="descripcion" rows="3" value={form.descripcion} onChange={handleChange} className="border border-gray-300 rounded p-2" />
        </label>

        {eligeDocente && (
          <label className="flex flex-col gap-1 text-sm">
            Docente
            <select name="docenteId" value={form.docenteId} onChange={handleChange} className="border border-gray-300 rounded p-2" required>
              <option value="">Selecciona un docente</option>
              {docentes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.apellido}, {d.nombre}
                  {d.especialidad ? ` · ${d.especialidad}` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

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

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-semibold mb-1">Horario de clases</legend>

          {form.horarios.map((sesion) => (
            <div key={sesion.uid} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <label className="flex flex-col gap-1 text-sm">
                Día
                <select
                  value={sesion.diaSemana}
                  onChange={(e) => cambiarSesion(sesion.uid, "diaSemana", e.target.value)}
                  className="border border-gray-300 rounded p-2"
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d.valor} value={d.valor}>{d.etiqueta}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Inicio
                <input
                  type="time"
                  value={sesion.horaInicio}
                  onChange={(e) => cambiarSesion(sesion.uid, "horaInicio", e.target.value)}
                  className="border border-gray-300 rounded p-2"
                  required
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Fin
                <input
                  type="time"
                  value={sesion.horaFin}
                  onChange={(e) => cambiarSesion(sesion.uid, "horaFin", e.target.value)}
                  className="border border-gray-300 rounded p-2"
                  required
                />
              </label>

              <button
                type="button"
                onClick={() => quitarSesion(sesion.uid)}
                disabled={form.horarios.length === 1}
                className="text-red-700 underline text-sm pb-2 disabled:opacity-40"
              >
                Quitar
              </button>
            </div>
          ))}

          <button type="button" onClick={agregarSesion} className="self-start text-sm underline">
            + Agregar sesión
          </button>
        </fieldset>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-black text-white py-2 rounded font-semibold">
          {saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear curso"}
        </button>
      </form>
    </div>
  );
}