import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Check, Info, Plus, Trash2 } from "lucide-react";
import { verCursoRequest, crearCursoRequest, actualizarCursoRequest } from "../../api/cursos";
import { listarDocentesRequest } from "../../api/docentes";
import { useAuthStore } from "../../auth/authStore";
import { puedeGestionarCurso, esCoordinadorOAdmin } from "../../auth/roles";
import { DIAS_SEMANA, recortarHora, validarHorarios } from "../../utils/horarios";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Input, { Select, Textarea } from "../../components/ui/Input";

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

  if (loading) return <p className="text-sm text-slate-400">Cargando formulario...</p>;
  if (esEdicion && !curso) {
    return <Alert variant="error" title="No se pudo cargar el curso">{error}</Alert>;
  }
  if (esEdicion && !puedeGestionarCurso(user, curso)) {
    return <Alert variant="error" title="Sin permiso">No tienes permiso para editar este curso.</Alert>;
  }

  const rutaCancelar = esEdicion ? `/cursos/${id}` : "/cursos";

  return (
    <div>
      <h1 className="text-xl font-semibold">{esEdicion ? "Editar curso" : "Crear curso"}</h1>
      <p className="text-xs text-slate-500 mb-5">
        {esEdicion ? "Modifique los datos del curso." : "Registro de un nuevo curso en la plataforma."}
      </p>

      {error && <Alert variant="error" title={error} className="mb-4" />}

      <div className="grid items-start gap-4 lg:grid-cols-[2fr_1fr]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold">Información básica</h2>
          <p className="text-[11px] text-slate-400 mb-4">Los campos con * son obligatorios.</p>

          <div className="flex flex-col gap-4">
            <Input label="Nombre del curso" name="nombre" value={form.nombre} onChange={handleChange} required />

            {eligeDocente && (
              <Select label="Docente" name="docenteId" value={form.docenteId} onChange={handleChange} required>
                <option value="">Selecciona un docente</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.apellido}, {d.nombre}
                    {d.especialidad ? ` · ${d.especialidad}` : ""}
                  </option>
                ))}
              </Select>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Input label="Fecha de inicio" type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} required />
              <Input label="Fecha de fin" type="date" name="fechaFin" value={form.fechaFin} onChange={handleChange} required />
              <Input label="Cupo máximo" type="number" min="1" name="cupoMaximo" value={form.cupoMaximo} onChange={handleChange} required />
            </div>

            <Textarea label="Descripción del curso" name="descripcion" rows="3" value={form.descripcion} onChange={handleChange} />

            <fieldset className="flex flex-col gap-3 border-t border-slate-100 pt-4">
              <legend className="sr-only">Horario de clases</legend>
              <p className="text-xs font-semibold">Horario de clases</p>

              {form.horarios.map((sesion) => (
                <div key={sesion.uid} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3">
                  <Select
                    label="Día"
                    value={sesion.diaSemana}
                    onChange={(e) => cambiarSesion(sesion.uid, "diaSemana", e.target.value)}
                  >
                    {DIAS_SEMANA.map((d) => (
                      <option key={d.valor} value={d.valor}>{d.etiqueta}</option>
                    ))}
                  </Select>
                  <Input
                    label="Inicio"
                    type="time"
                    value={sesion.horaInicio}
                    onChange={(e) => cambiarSesion(sesion.uid, "horaInicio", e.target.value)}
                    required
                  />
                  <Input
                    label="Fin"
                    type="time"
                    value={sesion.horaFin}
                    onChange={(e) => cambiarSesion(sesion.uid, "horaFin", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => quitarSesion(sesion.uid)}
                    disabled={form.horarios.length === 1}
                    aria-label="Quitar sesión"
                    className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={agregarSesion}
                className="flex items-center gap-1.5 self-start text-xs font-semibold text-primary hover:underline"
              >
                <Plus size={14} />
                Agregar sesión
              </button>
            </fieldset>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Link
              to={rutaCancelar}
              className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40"
            >
              <Check size={14} />
              {saving ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear curso"}
            </button>
          </div>
        </form>

        {!esEdicion && (
          <aside className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-800">
            <Info size={16} className="mt-0.5 shrink-0" />
            <p>
              Al crearse, el curso queda en estado <strong>Activo</strong>
              {eligeDocente ? "." : " y disponible para los estudiantes."}
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}