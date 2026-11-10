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
    <div className="min-w-32">
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-slate-400">
        {completadas} de {total} ({porcentaje} %)
      </p>
    </div>
  );
}

const estadoBadge = {
  ACTIVA: { variant: "success", label: "Activa" },
  CANCELADA: { variant: "neutral", label: "Cancelada" },
};

const thClase = "px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400";

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
        if (!cancelado) setError(mensajeError(err, "No se pudo cargar la lista de estudiantes"));
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
    if (detalleLoading) return <p className="text-xs text-slate-400">Cargando avance...</p>;
    if (detalleError) return <Alert variant="error" title={detalleError} />;
    if (!detalle) return null;
    if (detalle.detalle.length === 0) {
      return <p className="text-xs text-slate-500">Este curso aún no tiene lecciones.</p>;
    }
    return (
      <ul className="flex flex-col gap-1.5">
        {[...detalle.detalle]
          .sort((a, b) => a.orden - b.orden)
          .map((leccion) => (
            <li key={leccion.leccionId} className="flex items-center gap-2 text-xs">
              {leccion.completado ? (
                <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />
              ) : (
                <Circle size={14} className="shrink-0 text-slate-300" />
              )}
              <span className={leccion.completado ? "text-slate-700" : "text-slate-500"}>
                {leccion.orden}. {leccion.leccionTitulo}
              </span>
              {leccion.fechaCompletado && (
                <span className="text-[11px] text-slate-400">{leccion.fechaCompletado.slice(0, 10)}</span>
              )}
            </li>
          ))}
      </ul>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Estudiantes inscritos</h2>
          {!loading && !error && <Badge variant="info">{inscritos.length}</Badge>}
        </div>
        <Select label="Estado" value={estado} onChange={(e) => cambiarEstado(e.target.value)} className="w-40">
          <option value="">Todos</option>
          <option value="ACTIVA">Activas</option>
          <option value="CANCELADA">Canceladas</option>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Cargando estudiantes...</p>
      ) : error ? (
        <Alert variant="error" title="No se pudo cargar la lista de estudiantes">
          {error}
        </Alert>
      ) : inscritos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
          {estado ? "No hay inscripciones con ese estado." : "Aún no hay estudiantes inscritos en este curso."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className={thClase}>Estudiante</th>
                <th className={thClase}>Programa</th>
                <th className={thClase}>Estado</th>
                <th className={thClase}>Avance</th>
                <th className={thClase}>Nota final</th>
                <th className={thClase}></th>
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
                    <tr className="border-b border-slate-100 align-top last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-700 text-[11px] font-semibold text-white">
                            {iniciales(inscrito.nombre)}
                          </span>
                          <div className="leading-tight">
                            <p className="font-semibold">{inscrito.nombre}</p>
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
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          {abierto ? "Ocultar" : "Ver avance"}
                          {abierto ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      </td>
                    </tr>
                    {abierto && (
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <td colSpan={6} className="px-4 py-4">
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