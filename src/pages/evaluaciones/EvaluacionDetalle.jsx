import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { verEvaluacionRequest, publicarEvaluacionRequest } from "../../api/evaluaciones";
import { verCursoRequest } from "../../api/cursos";
import { useAuthStore } from "../../auth/authStore";
import { esDocenteDelCurso } from "../../auth/roles";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import { ESTADOS_EVALUACION, fechaEvaluacion, porcentaje } from "./evaluacionUtils";

export default function EvaluacionDetalle() {
  const { cursoId, tipo, evaluacionId } = useParams();
  if (!["tareas", "examenes"].includes(tipo)) return <Alert variant="error" title="Tipo de evaluación no válido." />;
  return <Detalle key={`${cursoId}-${tipo}-${evaluacionId}`} cursoId={cursoId} tipo={tipo} evaluacionId={evaluacionId} />;
}

function Dato({ etiqueta, children }) {
  return <div className="flex flex-wrap justify-between gap-2 border-b border-slate-100 py-3 last:border-b-0"><dt className="text-slate-500">{etiqueta}</dt><dd className="font-semibold">{children}</dd></div>;
}

function Detalle({ cursoId, tipo, evaluacionId }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [datos, setDatos] = useState({ curso: null, evaluacion: null, loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  const [publicando, setPublicando] = useState(false);
  const [errorPublicacion, setErrorPublicacion] = useState("");
  const [aviso, setAviso] = useState(location.state?.mensaje || "");
  const enviando = useRef(false);

  useEffect(() => {
    let vigente = true;
    Promise.all([verCursoRequest(cursoId), verEvaluacionRequest(tipo, evaluacionId)])
      .then(([curso, evaluacion]) => {
        if (!vigente) return;
        if (String(evaluacion.data.cursoId) !== cursoId) {
          setDatos({ curso: null, evaluacion: null, loading: false, error: "La evaluación no pertenece a este curso." });
          return;
        }
        setDatos({ curso: curso.data, evaluacion: evaluacion.data, loading: false, error: "" });
      }).catch((err) => {
        if (vigente) setDatos({ curso: null, evaluacion: null, loading: false, error: mensajeError(err, "No se pudo cargar la evaluación.") });
      });
    return () => { vigente = false; };
  }, [cursoId, tipo, evaluacionId, revision]);

  function recargar() {
    setDatos((actual) => ({ ...actual, loading: true, error: "" }));
    setRevision((n) => n + 1);
    setErrorPublicacion("");
  }

  async function publicar() {
    if (enviando.current || !window.confirm("¿Publicar esta evaluación? Será visible para los estudiantes inscritos.")) return;
    enviando.current = true;
    setPublicando(true);
    setErrorPublicacion("");
    try {
      const { data } = await publicarEvaluacionRequest(evaluacionId);
      setDatos((actual) => ({ ...actual, evaluacion: { ...actual.evaluacion, ...data } }));
      setAviso("La evaluación se publicó correctamente.");
    } catch (err) {
      setErrorPublicacion(mensajeError(err, "No se pudo publicar la evaluación."));
    } finally {
      enviando.current = false;
      setPublicando(false);
    }
  }

  const { curso, evaluacion, loading, error } = datos;
  return (
    <div>
      <Link to={`/cursos/${cursoId}/evaluaciones`} className="text-xs text-slate-500 hover:underline">← Volver a evaluaciones</Link>
      {loading ? <p className="mt-5 text-sm text-slate-400" role="status">Cargando evaluación...</p> : error ? <div className="mt-5"><Alert variant="error" title={error} /><button onClick={recargar} className="mt-3 text-xs font-semibold text-primary">Reintentar</button></div> : <>
        <div className="my-5 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0"><h1 className="break-words text-xl font-semibold">{evaluacion.titulo}</h1><p className="mt-1 text-xs text-slate-500">{curso.nombre} · {tipo === "tareas" ? "Tarea" : "Examen"}</p></div>
          <button className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50" onClick={recargar} disabled={publicando}>Actualizar</button>
        </div>
        {aviso && <Alert variant="success" title={aviso} className="mb-4" />}
        {errorPublicacion && <Alert variant="error" title={errorPublicacion} className="mb-4" />}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
          <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <div><h2 className="mb-2 text-sm font-semibold">Descripción</h2><p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">{evaluacion.descripcion || "Sin descripción."}</p></div>
            {tipo === "tareas" && <div><h2 className="mb-2 text-sm font-semibold">Instrucciones</h2><p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">{evaluacion.instrucciones || "Sin instrucciones adicionales."}</p></div>}
          </section>
          <aside className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold">Información</h2>
            <dl className="text-xs">
              <Dato etiqueta="Docente">{curso.docenteNombre}</Dato>
              <Dato etiqueta="Estado"><Badge variant={ESTADOS_EVALUACION[evaluacion.estado]?.variant}>{ESTADOS_EVALUACION[evaluacion.estado]?.label || evaluacion.estado}</Badge></Dato>
              <Dato etiqueta="Peso">{porcentaje(evaluacion.pesoPorcentual)} %</Dato>
              {tipo === "tareas" ? <>
                <Dato etiqueta="Fecha límite">{fechaEvaluacion(evaluacion.fechaLimite)}</Dato>
                <Dato etiqueta="Entrega tardía">{evaluacion.permiteEntregaTardia ? "Permitida" : "No permitida"}</Dato>
                {evaluacion.permiteEntregaTardia && <Dato etiqueta="Penalización">{porcentaje(evaluacion.penalizacionTardanzaPorcentaje ?? 0)} %</Dato>}
              </> : <>
                <Dato etiqueta="Fecha de aplicación">{fechaEvaluacion(evaluacion.fechaAplicacion)}</Dato>
                <Dato etiqueta="Duración configurada">{evaluacion.tiempoLimite} minutos</Dato>
                <Dato etiqueta="Intentos permitidos">{evaluacion.numeroIntentosPermitidos}</Dato>
                <Dato etiqueta="Configuración aleatoria">{evaluacion.aleatorio ? "Sí" : "No"}</Dato>
              </>}
              {evaluacion.fechaPublicacion && <Dato etiqueta="Publicada el">{fechaEvaluacion(evaluacion.fechaPublicacion)}</Dato>}
            </dl>
            {esDocenteDelCurso(user, curso) && evaluacion.estado === "BORRADOR" && <div className="mt-5 border-t border-slate-100 pt-4"><p className="mb-3 text-xs text-slate-500">Los estudiantes todavía no pueden ver este borrador.</p><button onClick={publicar} disabled={publicando} className="w-full rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{publicando ? "Publicando..." : "Publicar evaluación"}</button></div>}
          </aside>
        </div>
      </>}
    </div>
  );
}
