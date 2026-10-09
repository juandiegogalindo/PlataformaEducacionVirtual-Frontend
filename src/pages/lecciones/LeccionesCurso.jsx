import { useState, useEffect } from "react";
import {
  listarLeccionesRequest,
  crearLeccionRequest,
  actualizarLeccionRequest,
  eliminarLeccionRequest,
} from "../../api/lecciones";

const TIPOS_CONTENIDO = ["TEXTO", "VIDEO"];

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

export default function LeccionesCurso({ cursoId, puedeGestionar, inscrito }) {
  const puedeVer = puedeGestionar || inscrito;

  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  // null = formulario cerrado, "nueva" = creando, objeto lección = editando
  const [formAbierto, setFormAbierto] = useState(null);
  const [form, setForm] = useState(formVacio(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accionMsg, setAccionMsg] = useState("");
  const [borrandoId, setBorrandoId] = useState(null);

  const siguienteOrden =
    lecciones.length > 0 ? Math.max(...lecciones.map((l) => l.orden)) + 1 : 1;

  useEffect(() => {
    if (!puedeVer) return;
    listarLeccionesRequest(cursoId)
      .then((res) => {
        setError("");
        setLecciones([...res.data].sort((a, b) => a.orden - b.orden));
      })
      .catch((err) =>
        setError(err.response?.data?.mensaje || "No se pudieron cargar las lecciones")
      )
      .finally(() => setLoading(false));
  }, [cursoId, puedeVer, recarga]);

  function abrirNueva() {
    setForm(formVacio(siguienteOrden));
    setFormError("");
    setAccionMsg("");
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
    setAccionMsg("");
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
        setAccionMsg("Lección creada");
      } else {
        await actualizarLeccionRequest(cursoId, formAbierto.id, datos);
        setAccionMsg("Lección actualizada");
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
    setAccionMsg("");
    setBorrandoId(leccion.id);
    try {
      await eliminarLeccionRequest(cursoId, leccion.id);
      setAccionMsg("Lección eliminada");
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccionMsg(err.response?.data?.mensaje || "No se pudo eliminar la lección");
    } finally {
      setBorrandoId(null);
    }
  }

  if (!puedeVer) {
    return (
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-2">Lecciones</h2>
        <p className="text-gray-500">
          Las lecciones están disponibles para el docente del curso y para los estudiantes inscritos.
        </p>
      </section>
    );
  }

  const opcionesTipo = TIPOS_CONTENIDO.includes(form.tipoContenido)
    ? TIPOS_CONTENIDO
    : [...TIPOS_CONTENIDO, form.tipoContenido];

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Lecciones</h2>
        {puedeGestionar && !formAbierto && (
          <button onClick={abrirNueva} className="bg-black text-white px-3 py-1 rounded text-sm font-semibold">
            Nueva lección
          </button>
        )}
      </div>

      {accionMsg && <p className="text-sm mb-3">{accionMsg}</p>}

      {formAbierto && (
        <form onSubmit={handleSubmit} className="border border-gray-300 rounded p-4 mb-4 flex flex-col gap-3">
          <h3 className="font-semibold">{formAbierto === "nueva" ? "Nueva lección" : "Editar lección"}</h3>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <label className="flex flex-col gap-1 text-sm">
            Título
            <input name="titulo" value={form.titulo} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Tipo de contenido
            <select name="tipoContenido" value={form.tipoContenido} onChange={handleChange} className="border border-gray-300 rounded p-2">
              {opcionesTipo.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Contenido
            <textarea
              name="contenido"
              rows="4"
              placeholder="Texto de la lección o un enlace (https://...)"
              value={form.contenido}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Duración (minutos)
              <input type="number" min="1" name="duracionMinutos" value={form.duracionMinutos} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Orden
              <input type="number" min="1" name="orden" value={form.orden} onChange={handleChange} className="border border-gray-300 rounded p-2" required />
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-black text-white px-4 py-2 rounded font-semibold">
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" onClick={() => setFormAbierto(null)} className="border border-black px-4 py-2 rounded">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400">Cargando lecciones...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : lecciones.length === 0 ? (
        <p className="text-gray-500">
          {puedeGestionar
            ? "Este curso aún no tiene lecciones. Crea la primera con «Nueva lección»."
            : "El docente aún no ha publicado lecciones en este curso."}
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {lecciones.map((leccion) => (
            <li key={leccion.id} className="border border-gray-700 rounded p-3">
              <details>
                <summary className="cursor-pointer">
                  <span className="font-semibold">{leccion.orden}. {leccion.titulo}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {leccion.tipoContenido} · {leccion.duracionMinutos} min
                  </span>
                </summary>
                <div className="mt-3 text-sm">
                  {esUrl(leccion.contenido) ? (
                    <a href={leccion.contenido} target="_blank" rel="noopener noreferrer" className="underline">
                      Abrir contenido
                    </a>
                  ) : (
                    <p className="whitespace-pre-wrap">{leccion.contenido}</p>
                  )}
                </div>
              </details>

              {puedeGestionar && (
                <div className="flex gap-4 mt-3 text-sm">
                  <button onClick={() => abrirEdicion(leccion)} className="underline">
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(leccion)}
                    disabled={borrandoId === leccion.id}
                    className="text-red-700 underline"
                  >
                    {borrandoId === leccion.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}