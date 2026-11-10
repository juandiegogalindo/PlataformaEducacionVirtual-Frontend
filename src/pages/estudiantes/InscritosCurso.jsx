import { Fragment, useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { listarInscritosRequest, verProgresoEstudianteRequest } from "../../api/estudiantes";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import { Select } from "../../components/ui/Input";

function iniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function BarraAvance({ completadas, total }) {
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  return (
    <div className="min-w-32" aria-label={`Avance: ${completadas} de ${total} lecciones, ${porcentaje} por ciento`}>
      <div
        className="h-1.5 w-full rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={porcentaje}
      >
        <div className="h-1.5 rounded-full bg-primary transition-[width]" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        {total > 0 ? `${completadas} de ${total} (${porcentaje} %)` : "Sin lecciones"}
      </p>
    </div>
  );
}

const estadoBadge = {
  ACTIVA: { variant: "success", label: "Activa" },
  COMPLETADA: { variant: "info", label: "Completada" },
  CANCELADA: { variant: "neutral", label: "Cancelada" },
};

const thClase = "px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400";

function fechaLegible(fecha) {
  if (!fecha) return null;
  const fechaParsed = new Date(fecha);
  if (Number.isNaN(fechaParsed.getTime())) return null;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(fechaParsed);
}

export default function InscritosCurso({ cursoId }) {
  const [inscritos, setInscritos] = useState([]);
  const [estado, setEstado] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [abiertoId, setAbiertoId] = useState(null);
  const [detalle, setDetalle] = useState(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState("");
  const peticionRef = useRef(0);

  useEffect(() => {
    let cancelado = false;

    listarInscritosRequest(cursoId, estado)
      .then((res) => {
        if (cancelado) return;
        setError("");
        setInscritos(res.data);
      })
      .catch((err) => {
        if (!cancelado) {
          setInscritos([]);
          setError(mensajeError(err, "No se pudo cargar la lista de estudiantes"));
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [cursoId, estado]);

  function cambiarEstado(nuevoEstado) {
    peticionRef.current += 1;
    setLoading(true);
    setError("");
    setEstado(nuevoEstado);
    setAbiertoId(null);
    setDetalle(null);
    setDetalleLoading(false);
  }

  async function toggleDetalle(estudianteId) {
    peticionRef.current += 1;
    const miPeticion = peticionRef.current;

    if (abiertoId === estudianteId) {
      setAbiertoId(null);
      setDetalle(null);
      setDetalleLoading(false);
      return;
    }

    setAbiertoId(estudianteId);
    setDetalle(null);
    setDetalleError("");
    setDetalleLoading(true);
    try {
      const res = await verProgresoEstudianteRequest(cursoId, estudianteId);
      if (miPeticion !== peticionRef.current) return;
      setDetalle(res.data);
    } catch (err) {
      if (miPeticion !== peticionRef.current) return;
      setDetalleError(mensajeError(err, "No se pudo cargar el avance del estudiante"));
    } finally {
      if (miPeticion === peticionRef.current) setDetalleLoading(false);
    }
  }

  function renderDetalle() {
    if (detalleLoading) return <p className="text-xs text-slate-400" role="status">Cargando avance...</p>;
    if (detalleError) return <Alert variant="error" title={detalleError} />;
    if (!detalle) return null;
    if (detalle.detalle.length === 0) {
      return <p className="text-xs text-slate-500">Este curso aún no tiene lecciones publicadas.</p>;
    }
    return (
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {[...detalle.detalle]
          .sort((a, b) => a.orden - b.orden)
          .map((leccion) => (
            <li key={leccion.leccionId} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2.5 text-xs">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                {leccion.completado ? (
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-500" aria-hidden="true" />
                ) : (
                  <Circle size={15} className="shrink-0 text-slate-300" aria-hidden="true" />
                )}
                <span className={leccion.completado ? "text-slate-700" : "text-slate-500"}>
                  {leccion.orden}. {leccion.leccionTitulo}
                </span>
              </span>
              <span className={`text-[11px] ${leccion.completado ? "text-emerald-700" : "text-slate-400"}`}>
                {leccion.completado ? "Completada" : "Pendiente"}
              </span>
              {fechaLegible(leccion.fechaCompletado) && (
                <span className="w-full pl-6 text-[11px] text-slate-400">
                  Completada el {fechaLegible(leccion.fechaCompletado)}
                </span>
              )}
            </li>
          ))}
      </ul>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="seguimiento-estudiantes-titulo">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="seguimiento-estudiantes-titulo" className="text-sm font-semibold text-slate-900">
              Seguimiento de estudiantes
            </h2>
            {!loading && !error && <Badge variant="info">{inscritos.length}</Badge>}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Consulta el estado de inscripción y el avance de cada estudiante en el curso.
          </p>
        </div>
        <Select label="Estado de inscripción" value={estado} onChange={(e) => cambiarEstado(e.target.value)} className="w-full sm:w-52">
          <option value="">Todos</option>
          <option value="ACTIVA">Activa</option>
          <option value="COMPLETADA">Completada</option>
          <option value="CANCELADA">Cancelada</option>
        </Select>
      </div>

      {loading ? (
        <p className="rounded-lg bg-slate-50 px-4 py-8 text-center text-sm text-slate-400" role="status">
          Cargando estudiantes...
        </p>
      ) : error ? (
        <Alert variant="error" title="No se pudo cargar la lista de estudiantes">{error}</Alert>
      ) : inscritos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-9 text-center">
          <p className="text-sm font-medium text-slate-700">
            {estado ? "No hay inscripciones con ese estado." : "Aún no hay estudiantes inscritos en este curso."}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {estado ? "Prueba con otro filtro para consultar las inscripciones." : "Cuando haya estudiantes inscritos, su avance aparecerá aquí."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[820px] border-collapse text-left text-xs">
            <caption className="sr-only">Estudiantes inscritos y progreso de lecciones en el curso</caption>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className={thClase}>Estudiante</th>
                <th className={thClase}>Programa</th>
                <th className={thClase}>Estado</th>
                <th className={thClase}>Avance</th>
                <th className={thClase}>Nota final</th>
                <th className={thClase}><span className="sr-only">Detalle del avance</span></th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((inscrito) => {
                const abierto = abiertoId === inscrito.estudianteId;
                const badge = estadoBadge[inscrito.estadoInscripcion] ?? {
                  variant: "neutral",
                  label: inscrito.estadoInscripcion,
                };
                return (
                  <Fragment key={inscrito.inscripcionId}>
                    <tr className="border-b border-slate-100 align-top last:border-b-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-700 text-[11px] font-semibold text-white">
                            {iniciales(inscrito.nombre)}
                          </span>
                          <div className="leading-tight">
                            <p className="font-semibold text-slate-800">{inscrito.nombre}</p>
                            <p className="text-[11px] text-slate-400">
                              {inscrito.correo} · {inscrito.codigoEstudiantil}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {inscrito.programaAcademico}
                        <p className="text-[11px] text-slate-400">Semestre {inscrito.semestre}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <BarraAvance
                          completadas={inscrito.leccionesCompletadas}
                          total={inscrito.totalLecciones}
                        />
                      </td>
                      <td className="px-4 py-3 font-semibold">{inscrito.calificacionFinal ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleDetalle(inscrito.estudianteId)}
                          aria-expanded={abierto}
                          aria-controls={`progreso-estudiante-${inscrito.estudianteId}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                        >
                          {abierto ? "Ocultar" : "Ver avance"}
                          {abierto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </td>
                    </tr>
                    {abierto && (
                      <tr id={`progreso-estudiante-${inscrito.estudianteId}`} className="border-b border-slate-100 bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="mb-2 flex items-center gap-2">
                            <p className="text-xs font-semibold text-slate-700">Avance por lección</p>
                            {detalle && <span className="text-[11px] text-slate-400">{detalle.leccionesCompletadas} de {detalle.totalLecciones} completadas</span>}
                          </div>
                          {renderDetalle()}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
