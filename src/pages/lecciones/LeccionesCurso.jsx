import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Pencil,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import {
  listarLeccionesRequest,
  crearLeccionRequest,
  actualizarLeccionRequest,
  eliminarLeccionRequest,
} from "../../api/lecciones";
import { verProgresoRequest, marcarProgresoRequest } from "../../api/progreso";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Input, { Select, Textarea } from "../../components/ui/Input";

const TIPOS_CONTENIDO = ["TEXTO", "VIDEO"];
const TIPO_LABEL = { TEXTO: "Texto", VIDEO: "Video" };

function esUrl(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function formVacio(siguienteOrden) {
  return {
    titulo: "",
    contenido: "",
    tipoContenido: TIPOS_CONTENIDO[0],
    duracionMinutos: "",
    orden: String(siguienteOrden),
  };
}

function Panel({ children, className = "" }) {
  return <div className={`rounded-xl border border-slate-200 bg-white p-5 ${className}`}>{children}</div>;
}

function ContenidoLeccion({ leccion }) {
  const url = esUrl(leccion.contenido);

  if (leccion.tipoContenido === "VIDEO" && url) {
    return (
      <a
        href={leccion.contenido}
        target="_blank"
        rel="noopener noreferrer"
        className="group grid aspect-video place-items-center rounded-lg bg-sidebar"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-700 text-white group-hover:bg-primary">
          <Play size={20} />
        </span>
        <span className="sr-only">Abrir video</span>
      </a>
    );
  }

  if (url) {
    return (
      <a
        href={leccion.contenido}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        <ExternalLink size={14} />
        Abrir contenido
      </a>
    );
  }

  return <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-600">{leccion.contenido}</p>;
}

export default function LeccionesCurso({ cursoId, puedeGestionar, inscrito }) {
  const puedeVer = puedeGestionar || inscrito;

  const [lecciones, setLecciones] = useState([]);
  const [progreso, setProgreso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [marcandoId, setMarcandoId] = useState(null);
  const [seleccionadaId, setSeleccionadaId] = useState(null);

  // null = formulario cerrado, "nueva" = creando, objeto lección = editando
  const [formAbierto, setFormAbierto] = useState(null);
  const [form, setForm] = useState(formVacio(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accion, setAccion] = useState(null); // { variant, texto }
  const [borrandoId, setBorrandoId] = useState(null);

  const siguienteOrden =
    lecciones.length > 0 ? Math.max(...lecciones.map((l) => l.orden)) + 1 : 1;

  useEffect(() => {
    if (!puedeVer) return;

    const leccionesPromise = listarLeccionesRequest(cursoId);
    const progresoPromise = inscrito
      ? verProgresoRequest(cursoId).catch(() => ({ data: null }))
      : Promise.resolve({ data: null });

    Promise.all([leccionesPromise, progresoPromise])
      .then(([leccionesRes, progresoRes]) => {
        setError("");
        setLecciones([...leccionesRes.data].sort((a, b) => a.orden - b.orden));
        setProgreso(progresoRes.data);
      })
      .catch((err) =>
        setError(err.response?.data?.mensaje || "No se pudieron cargar las lecciones")
      )
      .finally(() => setLoading(false));
  }, [cursoId, puedeVer, inscrito, recarga]);

  function abrirNueva() {
    setForm(formVacio(siguienteOrden));
    setFormError("");
    setAccion(null);
    setFormAbierto("nueva");
  }

  function abrirEdicion(leccion) {
    setForm({
      titulo: leccion.titulo,
      contenido: leccion.contenido,
      tipoContenido: leccion.tipoContenido,
      duracionMinutos: String(leccion.duracionMinutos),
      orden: String(leccion.orden),
    });
    setFormError("");
    setAccion(null);
    setFormAbierto(leccion);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validar() {
    if (!form.titulo.trim()) return "El título es obligatorio";
    if (!form.contenido.trim()) return "El contenido es obligatorio";
    if (Number(form.duracionMinutos) < 1) return "La duración debe ser de al menos 1 minuto";
    if (Number(form.orden) < 1) return "El orden debe ser 1 o mayor";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    const mensaje = validar();
    if (mensaje) {
      setFormError(mensaje);
      return;
    }

    const datos = {
      ...form,
      duracionMinutos: Number(form.duracionMinutos),
      orden: Number(form.orden),
    };
    setSaving(true);
    try {
      if (formAbierto === "nueva") {
        await crearLeccionRequest(cursoId, datos);
        setAccion({ variant: "success", texto: `Lección publicada: «${datos.titulo}»` });
      } else {
        await actualizarLeccionRequest(cursoId, formAbierto.id, datos);
        setAccion({ variant: "success", texto: "Lección actualizada" });
      }
      setFormAbierto(null);
      setRecarga((r) => r + 1);
    } catch (err) {
      setFormError(err.response?.data?.mensaje || "No se pudo guardar la lección");
    } finally {
      setSaving(false);
    }
  }

  async function handleEliminar(leccion) {
    if (!window.confirm(`¿Eliminar la lección "${leccion.titulo}"? Esta acción no se puede deshacer.`)) return;
    setAccion(null);
    setBorrandoId(leccion.id);
    try {
      await eliminarLeccionRequest(cursoId, leccion.id);
      setAccion({ variant: "success", texto: "Lección eliminada" });
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccion({ variant: "error", texto: err.response?.data?.mensaje || "No se pudo eliminar la lección" });
    } finally {
      setBorrandoId(null);
    }
  }

  async function handleToggleCompletada(leccion, completado) {
    setAccion(null);
    setMarcandoId(leccion.id);
    try {
      await marcarProgresoRequest(cursoId, leccion.id, completado);
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccion({ variant: "error", texto: err.response?.data?.mensaje || "No se pudo actualizar tu progreso" });
    } finally {
      setMarcandoId(null);
    }
  }

  // Estado "acceso no autorizado" (fig. 9.13)
  if (!puedeVer) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold">Contenido del curso</h2>
        <Alert variant="error" title="Acceso no autorizado">
          No se encuentra inscrito en este curso. Para consultar su contenido, inscríbase desde el catálogo de cursos.
        </Alert>
      </section>
    );
  }

  const opcionesTipo = TIPOS_CONTENIDO.includes(form.tipoContenido)
    ? TIPOS_CONTENIDO
    : [...TIPOS_CONTENIDO, form.tipoContenido];

  const mostrarProgreso = inscrito && progreso !== null;
  const total = progreso?.totalLecciones ?? 0;
  const completadas = progreso?.leccionesCompletadas ?? 0;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const estaCompletada = (id) =>
    Boolean(progreso?.detalle?.find((d) => d.leccionId === id)?.completado);

  const primeraPendiente = lecciones.find((l) => !estaCompletada(l.id));
  const actual =
    lecciones.find((l) => l.id === seleccionadaId) ?? primeraPendiente ?? lecciones[0];
  const indiceActual = actual ? lecciones.findIndex((l) => l.id === actual.id) : -1;
  const completadaActual = actual ? estaCompletada(actual.id) : false;
  const fechaCompletado = actual
    ? progreso?.detalle?.find((d) => d.leccionId === actual.id)?.fechaCompletado
    : null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Contenido del curso</h2>
        {puedeGestionar && !formAbierto && (
          <button
            onClick={abrirNueva}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={14} />
            Nueva lección
          </button>
        )}
      </div>

      {accion && <Alert variant={accion.variant} title={accion.texto} className="mb-4" />}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando lecciones...</p>
      ) : error ? (
        <Alert variant="error" title="No se pudieron cargar las lecciones">{error}</Alert>
      ) : lecciones.length === 0 && !formAbierto ? (
        // Estado "sin contenido publicado" (fig. 9.12)
        <Panel className="py-12 text-center">
          <span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-lg bg-amber-50 text-amber-500">
            <Layers size={18} />
          </span>
          <p className="text-sm font-semibold">Este curso aún no tiene contenido publicado</p>
          <p className="mt-1 text-xs text-slate-500">
            {puedeGestionar
              ? "Crea la primera lección con «Nueva lección»."
              : "El docente publicará las lecciones próximamente."}
          </p>
        </Panel>
      ) : (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
          {/* Columna izquierda: progreso + índice */}
          <div className="flex flex-col gap-4">
            {mostrarProgreso && total > 0 && (
              <Panel>
                <p className="text-xs font-semibold">Progreso</p>
                <p className="mt-1 text-2xl font-semibold">{porcentaje}%</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${porcentaje}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {completadas} de {total} lecciones completadas
                </p>
              </Panel>
            )}

            <Panel>
              <p className="mb-3 text-xs font-semibold">Lecciones</p>
              <ol className="flex flex-col gap-1">
                {lecciones.map((leccion) => {
                  const completada = estaCompletada(leccion.id);
                  const seleccionada = actual?.id === leccion.id && !formAbierto;
                  return (
                    <li key={leccion.id}>
                      <button
                        onClick={() => {
                          setFormAbierto(null);
                          setSeleccionadaId(leccion.id);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs ${
                          seleccionada
                            ? "bg-blue-50 font-semibold text-primary"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {mostrarProgreso ? (
                          completada ? (
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                          ) : (
                            <Circle size={16} className="shrink-0 text-slate-300" />
                          )
                        ) : (
                          <span className="grid h-4 w-4 shrink-0 place-items-center text-[10px] text-slate-400">
                            {leccion.orden}
                          </span>
                        )}
                        <span className="truncate">
                          {mostrarProgreso ? `${leccion.orden}. ` : ""}
                          {leccion.titulo}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </Panel>
          </div>

          {/* Columna derecha: formulario o lección seleccionada */}
          {formAbierto ? (
            <Panel>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">
                  {formAbierto === "nueva" ? "Publicar lección" : "Editar lección"}
                </h3>

                {formError && <Alert variant="error" title={formError} />}

                <Input label="Título" name="titulo" value={form.titulo} onChange={handleChange} required />

                <div className="grid grid-cols-3 gap-3">
                  <Select label="Tipo de contenido" name="tipoContenido" value={form.tipoContenido} onChange={handleChange} required>
                    {opcionesTipo.map((tipo) => (
                      <option key={tipo} value={tipo}>{TIPO_LABEL[tipo] || tipo}</option>
                    ))}
                  </Select>
                  <Input label="Duración (minutos)" type="number" min="1" name="duracionMinutos" value={form.duracionMinutos} onChange={handleChange} required />
                  <Input label="Orden" type="number" min="1" name="orden" value={form.orden} onChange={handleChange} required />
                </div>

                <Textarea
                  label="Contenido"
                  name="contenido"
                  rows="5"
                  placeholder="Texto de la lección o un enlace (https://...)"
                  value={form.contenido}
                  onChange={handleChange}
                  required
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40"
                  >
                    {saving ? "Guardando..." : formAbierto === "nueva" ? "Publicar lección" : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </Panel>
          ) : (
            actual && (
              <Panel>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold">{actual.titulo}</h3>
                    <p className="text-[11px] text-slate-400">
                      {TIPO_LABEL[actual.tipoContenido] || actual.tipoContenido} · {actual.duracionMinutos} minutos
                    </p>
                  </div>

                  {mostrarProgreso && (
                    <Badge variant={completadaActual ? "success" : "warning"}>
                      {completadaActual ? "Completada" : "En progreso"}
                    </Badge>
                  )}

                  {puedeGestionar && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirEdicion(actual)}
                        className="flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        <Pencil size={12} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(actual)}
                        disabled={borrandoId === actual.id}
                        className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {borrandoId === actual.id ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <ContenidoLeccion leccion={actual} />
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => setSeleccionadaId(lecciones[indiceActual - 1].id)}
                    disabled={indiceActual <= 0}
                    className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Anterior
                  </button>

                  {mostrarProgreso ? (
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => handleToggleCompletada(actual, !completadaActual)}
                        disabled={marcandoId === actual.id}
                        className={
                          completadaActual
                            ? "flex items-center gap-1.5 rounded-md border border-emerald-300 px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                            : "flex items-center gap-1.5 rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                        }
                      >
                        <Check size={14} />
                        {completadaActual ? "Completada · Desmarcar" : "Marcar como completada"}
                      </button>
                      {completadaActual && fechaCompletado && (
                        <span className="text-[11px] text-slate-400">el {fechaCompletado.slice(0, 10)}</span>
                      )}
                    </div>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={() => setSeleccionadaId(lecciones[indiceActual + 1].id)}
                    disabled={indiceActual >= lecciones.length - 1}
                    className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
                  >
                    Siguiente
                    <ChevronRight size={14} />
                  </button>
                </div>
              </Panel>
            )
          )}
        </div>
      )}
    </section>
  );
}