import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import { esDocenteDelCurso, ROLES } from "../../auth/roles";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Input, { Select } from "../../components/ui/Input";
import useEvaluacionesCurso from "../../utils/useEvaluacionesCurso";
import { ESTADOS_EVALUACION, porcentaje, pesoTotal, rutaEvaluacion } from "../../utils/evaluacionUtils";

export default function EvaluacionesCurso() {
  const { cursoId } = useParams();
  return <ListadoCurso key={cursoId} cursoId={cursoId} />;
}

function ListadoCurso({ cursoId }) {
  const user = useAuthStore((state) => state.user);
  const { curso, evaluaciones, loading, error, recargar } = useEvaluacionesCurso(cursoId);
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [estado, setEstado] = useState("");
  const location = useLocation();
  const visibles = evaluaciones.filter((evaluacion) => (!tipo || tipo === evaluacion.tipo)
    && (!estado || estado === evaluacion.estado)
    && evaluacion.titulo.toLocaleLowerCase("es").includes(busqueda.trim().toLocaleLowerCase("es")));
  const puedeCrear = esDocenteDelCurso(user, curso);

  return (
    <div>
      <Link to="/evaluaciones" className="text-xs text-slate-500 hover:underline">← Cambiar de curso</Link>
      <div className="my-5 flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-xl font-semibold">Evaluaciones del curso</h1><p className="text-xs text-slate-500">{curso?.nombre}</p></div>
        {puedeCrear && !loading && !error && <div className="flex flex-wrap gap-2"><Link to={`/cursos/${cursoId}/calificaciones`} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-primary hover:bg-slate-50">Calificaciones del curso</Link><Link to={`/cursos/${cursoId}/evaluaciones/nueva`} className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"><Plus size={14} /> Crear evaluación</Link></div>}
      </div>
      {location.state?.mensaje && <Alert variant="success" title={location.state.mensaje} className="mb-4" />}
      {loading ? <p className="text-sm text-slate-400" role="status">Cargando evaluaciones...</p> : error ? (
        <div><Alert variant="error" title={error} /><button onClick={recargar} className="mt-3 text-xs font-semibold text-primary">Reintentar</button></div>
      ) : (
        <>
          {user.rol !== ROLES.ESTUDIANTE && <p className="mb-4 text-xs text-slate-500">Peso asignado: <strong className="text-slate-700">{porcentaje(pesoTotal(evaluaciones))} %</strong> de 100 %</p>}
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <Input label="Buscar evaluación" type="search" placeholder="Título de la evaluación" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
            <Select label="Tipo" aria-label="Tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}><option value="">Todos los tipos</option><option value="TAREA">Tarea</option><option value="EXAMEN">Examen</option></Select>
            <Select label="Estado" aria-label="Estado" value={estado} onChange={(event) => setEstado(event.target.value)}><option value="">Todos los estados</option>{Object.entries(ESTADOS_EVALUACION).filter(([value]) => value !== "BORRADOR" || user.rol !== ROLES.ESTUDIANTE).map(([value, info]) => <option key={value} value={value}>{info.label}</option>)}</Select>
          </div>
          {visibles.length ? <div className="grid gap-4 lg:grid-cols-2">{visibles.map((evaluacion) => (
            <article key={evaluacion.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">{evaluacion.tipo === "EXAMEN" ? "Examen" : "Tarea"}</span><Badge variant={ESTADOS_EVALUACION[evaluacion.estado]?.variant}>{ESTADOS_EVALUACION[evaluacion.estado]?.label || evaluacion.estado}</Badge></div>
              <h2 className="break-words text-sm font-semibold">{evaluacion.titulo}</h2>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-xs text-slate-500">{evaluacion.descripcion || "Sin descripción."}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs"><span className="text-slate-500">Peso: <strong>{porcentaje(evaluacion.pesoPorcentual)} %</strong></span><Link className="font-semibold text-primary hover:underline" to={rutaEvaluacion(cursoId, evaluacion.tipo, evaluacion.id)}>Ver detalle</Link></div>
            </article>
          ))}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            <p>{evaluaciones.length ? "No hay evaluaciones que coincidan con los filtros." : "No hay evaluaciones disponibles en este curso."}</p>
            {(busqueda || tipo || estado) && <button className="mt-3 text-xs font-semibold text-primary" onClick={() => { setBusqueda(""); setTipo(""); setEstado(""); }}>Limpiar filtros</button>}
          </div>}
        </>
      )}
    </div>
  );
}
