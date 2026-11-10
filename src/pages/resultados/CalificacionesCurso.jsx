import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { verCursoRequest } from "../../api/cursos";
import { calificacionesCursoRequest, calificarResultadoRequest } from "../../api/resultados";
import { useAuthStore } from "../../auth/authStore";
import { esDocenteDelCurso } from "../../auth/roles";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Input, { Select, Textarea } from "../../components/ui/Input";
import DetalleResultado, { EstadoResultado } from "./DetalleResultado";
import { notaResultado, validarCalificacion } from "../../utils/resultadoUtils";

export default function CalificacionesCurso() {
  const { cursoId } = useParams();
  return <ResultadosCurso key={cursoId} cursoId={cursoId} />;
}

function ResultadosCurso({ cursoId }) {
  const user = useAuthStore((state) => state.user);
  const [datos, setDatos] = useState({ curso: null, resultados: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [seleccion, setSeleccion] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [params, setParams] = useSearchParams();
  const evaluacionId = params.get("evaluacion") || "";

  useEffect(() => {
    let vigente = true;
    Promise.all([verCursoRequest(cursoId), calificacionesCursoRequest(cursoId)]).then(([curso, resultados]) => {
      if (vigente) setDatos({ curso: curso.data, resultados: resultados.data, loading: false, error: "" });
    }).catch((err) => {
      if (vigente) setDatos({ curso: null, resultados: [], loading: false, error: mensajeError(err, "No se pudieron cargar las entregas.") });
    });
    return () => { vigente = false; };
  }, [cursoId, revision]);

  function recargar() {
    setDatos((actual) => ({ ...actual, loading: true, error: "" }));
    setRevision((n) => n + 1);
  }

  function guardarResultado(resultado) {
    setDatos((actual) => ({ ...actual, resultados: actual.resultados.map((r) => r.id === resultado.id ? resultado : r) }));
    setSeleccion(resultado.id);
    setAviso(`Calificación guardada: ${notaResultado(resultado.calificacion)}.`);
  }

  const evaluaciones = new Map(datos.resultados.map((resultado) => [String(resultado.evaluacionId), resultado.evaluacionTitulo]));
  const visibles = datos.resultados.filter((resultado) => (!evaluacionId || String(resultado.evaluacionId) === evaluacionId)
    && (!estado || estado === resultado.estado)
    && resultado.estudianteNombre.toLocaleLowerCase("es").includes(busqueda.trim().toLocaleLowerCase("es")))
    .sort((a, b) => a.estudianteNombre.localeCompare(b.estudianteNombre, "es") || b.numeroIntento - a.numeroIntento);
  const seleccionado = visibles.find((resultado) => resultado.id === seleccion) || visibles[0];

  return <div>
    <Link to={`/cursos/${cursoId}/evaluaciones`} className="text-xs text-slate-500 hover:underline">← Volver a evaluaciones</Link>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Calificaciones del curso</h1><p className="text-xs text-slate-500">{datos.curso?.nombre}</p></div><button onClick={recargar} disabled={ocupado || datos.loading} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50">Actualizar</button></div>
    {datos.loading ? <p className="text-sm text-slate-400" role="status">Cargando entregas...</p> : datos.error ? <div><Alert variant="error" title={datos.error} /><button onClick={recargar} className="mt-3 text-xs font-semibold text-primary">Reintentar</button></div> : !esDocenteDelCurso(user, datos.curso) ? <Alert variant="error" title="Solo el docente responsable puede consultar estas calificaciones." /> : <>
      {aviso && <Alert variant="success" title={aviso} className="mb-4" />}
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Input label="Buscar estudiante" type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} disabled={ocupado} />
        <Select label="Evaluación" aria-label="Evaluación" value={evaluacionId} onChange={(event) => setParams(event.target.value ? { evaluacion: event.target.value } : {})} disabled={ocupado}><option value="">Todas las evaluaciones</option>{[...evaluaciones].map(([id, titulo]) => <option key={id} value={id}>{titulo}</option>)}{evaluacionId && !evaluaciones.has(evaluacionId) && <option value={evaluacionId}>Evaluación sin entregas</option>}</Select>
        <Select label="Estado" aria-label="Estado" value={estado} onChange={(event) => setEstado(event.target.value)} disabled={ocupado}><option value="">Todos los estados</option><option value="PENDIENTE">Pendiente de calificar</option><option value="CALIFICADO">Calificado</option></Select>
      </div>
      {visibles.length ? <div className="grid items-start gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4" aria-label="Entregas del curso"><h2 className="mb-3 text-sm font-semibold">Entregas ({visibles.length})</h2><ul className="space-y-2">{visibles.map((resultado) => <li key={resultado.id}><button disabled={ocupado} aria-pressed={seleccionado?.id === resultado.id} onClick={() => setSeleccion(resultado.id)} className={`w-full rounded-lg border p-3 text-left text-xs disabled:opacity-50 ${seleccionado?.id === resultado.id ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><span className="mb-1 block font-semibold">{resultado.estudianteNombre}</span><span className="mb-2 block break-words text-slate-500">{resultado.evaluacionTitulo} · Intento {resultado.numeroIntento}</span><EstadoResultado resultado={resultado} /></button></li>)}</ul></section>
        <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 sm:p-6" aria-label="Calificar entrega"><h2 className="mb-1 text-sm font-semibold">Entrega de {seleccionado.estudianteNombre}</h2><p className="mb-4 break-words text-xs text-slate-500">{seleccionado.evaluacionTitulo}</p><DetalleResultado resultado={seleccionado} /><CalificarResultado key={seleccionado.id} resultado={seleccionado} onGuardado={guardarResultado} onGuardando={setOcupado} /></section>
      </div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500"><p>{datos.resultados.length ? "No hay entregas que coincidan con los filtros." : "Todavía no hay entregas ni intentos registrados en este curso."}</p>{(busqueda || estado || evaluacionId) && <button className="mt-3 text-xs font-semibold text-primary" onClick={() => { setBusqueda(""); setEstado(""); setParams({}); }}>Limpiar filtros</button>}</div>}
    </>}
  </div>;
}

function CalificarResultado({ resultado, onGuardado, onGuardando }) {
  const [nota, setNota] = useState("");
  const [retroalimentacion, setRetroalimentacion] = useState(resultado.retroalimentacion || "");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const enviando = useRef(false);

  async function calificar(event) {
    event.preventDefault();
    if (enviando.current) return;
    const problema = validarCalificacion(nota);
    if (problema) { setError(problema); return; }
    if (!window.confirm("¿Guardar la calificación y la retroalimentación de esta entrega?")) return;
    enviando.current = true;
    setGuardando(true);
    onGuardando(true);
    setError("");
    try {
      const { data } = await calificarResultadoRequest(resultado.id, { calificacion: Number(nota), retroalimentacion: retroalimentacion.trim() });
      onGuardado(data);
      setNota("");
    } catch (err) {
      setError(mensajeError(err, "No se pudo guardar la calificación."));
    } finally {
      enviando.current = false;
      setGuardando(false);
      onGuardando(false);
    }
  }

  return <form onSubmit={calificar} className="mt-5 space-y-4 border-t border-slate-100 pt-5" aria-label="Calificar resultado">
    <h3 className="text-sm font-semibold">{resultado.estado === "CALIFICADO" ? "Actualizar calificación" : "Calificar entrega"}</h3>
    {error && <Alert variant="error" title={error} />}
    {resultado.entregaTardia && <Alert variant="warning" title="Entrega tardía">Ingresa la nota antes de la penalización. Si hay una penalización configurada, se aplicará al guardar.</Alert>}
    <Input label="Calificación (0 a 5)" name="calificacion" type="number" min="0" max="5" step="any" required value={nota} onChange={(event) => setNota(event.target.value)} disabled={guardando} />
    <Textarea label="Retroalimentación" name="retroalimentacion" rows={4} value={retroalimentacion} onChange={(event) => setRetroalimentacion(event.target.value)} disabled={guardando} />
    <button type="submit" disabled={guardando} className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{guardando ? "Guardando..." : "Guardar calificación"}</button>
  </form>;
}
