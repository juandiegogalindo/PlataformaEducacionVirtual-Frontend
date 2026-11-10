import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { misCalificacionesRequest } from "../../api/resultados";
import { misCursosRequest } from "../../api/inscripciones";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Input, { Select } from "../../components/ui/Input";
import DetalleResultado, { EstadoResultado } from "./DetalleResultado";
import { notaResultado } from "./resultadoUtils";

export default function MisCalificaciones() {
  const [datos, setDatos] = useState({ resultados: [], cursos: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [params, setParams] = useSearchParams();
  const cursoId = params.get("curso") || "";

  useEffect(() => {
    let vigente = true;
    Promise.all([misCalificacionesRequest(), misCursosRequest()]).then(([resultados, cursos]) => {
      if (vigente) setDatos({ resultados: resultados.data, cursos: cursos.data, loading: false, error: "" });
    }).catch((err) => {
      if (vigente) setDatos({ resultados: [], cursos: [], loading: false, error: mensajeError(err, "No se pudieron cargar tus calificaciones.") });
    });
    return () => { vigente = false; };
  }, [revision]);

  function recargar() {
    setDatos((actual) => ({ ...actual, loading: true, error: "" }));
    setRevision((n) => n + 1);
  }

  const nombres = new Map(datos.cursos.map((curso) => [String(curso.cursoId), curso.cursoNombre]));
  datos.resultados.forEach((resultado) => { if (!nombres.has(String(resultado.cursoId))) nombres.set(String(resultado.cursoId), "Curso del historial"); });
  const visibles = datos.resultados.filter((resultado) => (!cursoId || String(resultado.cursoId) === cursoId)
    && (!estado || resultado.estado === estado)
    && resultado.evaluacionTitulo.toLocaleLowerCase("es").includes(busqueda.trim().toLocaleLowerCase("es")))
    .sort((a, b) => (b.fechaRegistro || "").localeCompare(a.fechaRegistro || "") || b.numeroIntento - a.numeroIntento);

  return <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">Mis calificaciones</h1><p className="text-xs text-slate-500">Consulta tus entregas, intentos y retroalimentación por curso.</p></div><button onClick={recargar} disabled={datos.loading} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50">Actualizar</button></div>
    {datos.loading ? <p className="text-sm text-slate-400" role="status">Cargando calificaciones...</p> : datos.error ? <div><Alert variant="error" title={datos.error} /><button onClick={recargar} className="mt-3 text-xs font-semibold text-primary">Reintentar</button></div> : <>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Select label="Curso" aria-label="Curso" value={cursoId} onChange={(event) => setParams(event.target.value ? { curso: event.target.value } : {})}><option value="">Todos los cursos</option>{[...nombres].map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}{cursoId && !nombres.has(cursoId) && <option value={cursoId}>Curso seleccionado</option>}</Select>
        <Input label="Buscar actividad" type="search" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        <Select label="Estado" aria-label="Estado" value={estado} onChange={(event) => setEstado(event.target.value)}><option value="">Todos los estados</option><option value="PENDIENTE">Pendiente de calificar</option><option value="CALIFICADO">Calificado</option></Select>
      </div>
      {visibles.length ? <div className="space-y-3">{visibles.map((resultado) => <article key={resultado.id} className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap justify-between gap-3"><div><p className="mb-1 text-xs text-slate-500">{nombres.get(String(resultado.cursoId))} · Intento {resultado.numeroIntento}</p><h2 className="break-words text-sm font-semibold">{resultado.evaluacionTitulo}</h2></div><div className="space-y-2 text-right"><EstadoResultado resultado={resultado} /><p className="text-sm font-semibold text-primary">{notaResultado(resultado.calificacion)}</p></div></div>
        <details className="mt-4 border-t border-slate-100 pt-3"><summary className="cursor-pointer text-xs font-semibold text-primary">Ver entrega y retroalimentación</summary><div className="mt-4"><DetalleResultado resultado={resultado} /></div></details>
      </article>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500"><p>{datos.resultados.length ? "No hay resultados que coincidan con los filtros." : "Todavía no has registrado entregas ni intentos."}</p>{(cursoId || estado || busqueda) && <button className="mt-3 text-xs font-semibold text-primary" onClick={() => { setParams({}); setEstado(""); setBusqueda(""); }}>Limpiar filtros</button>}<Link to="/evaluaciones" className="mt-3 block text-xs font-semibold text-primary">Ver evaluaciones</Link></div>}
    </>}
  </div>;
}
