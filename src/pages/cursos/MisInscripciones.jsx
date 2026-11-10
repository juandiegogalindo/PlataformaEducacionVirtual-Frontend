import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, CalendarDays, Award, RotateCcw, X } from "lucide-react";
import { misCursosRequest, cancelarInscripcionRequest, inscribirseRequest } from "../../api/inscripciones";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";

const estadoBadge = {
  ACTIVA: { variant: "success", label: "Activa" },
  CANCELADA: { variant: "neutral", label: "Cancelada" },
};

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accion, setAccion] = useState(null); // { variant, texto }
  const [ocupandoId, setOcupandoId] = useState(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    misCursosRequest()
      .then((res) => {
        setError("");
        const ordenadas = [...res.data].sort((a, b) =>
          b.fechaInscripcion.localeCompare(a.fechaInscripcion)
        );
        setInscripciones(ordenadas);
      })
      .catch((err) => setError(mensajeError(err, "No se pudieron cargar tus inscripciones")))
      .finally(() => setLoading(false));
  }, [recarga]);

  async function ejecutar(inscripcion, accionFn, mensajeExito, mensajeFallo) {
    setAccion(null);
    setOcupandoId(inscripcion.id);
    try {
      await accionFn();
      setAccion({ variant: "success", texto: mensajeExito });
      setRecarga((r) => r + 1);
    } catch (err) {
      const variant = err.response?.status === 409 ? "warning" : "error";
      setAccion({ variant, texto: mensajeError(err, mensajeFallo) });
    } finally {
      setOcupandoId(null);
    }
  }

  function handleCancelar(inscripcion) {
    if (!window.confirm(`¿Cancelar tu inscripción a "${inscripcion.cursoNombre}"?`)) return;
    ejecutar(
      inscripcion,
      () => cancelarInscripcionRequest(inscripcion.id),
      "Inscripción cancelada",
      "No se pudo cancelar la inscripción"
    );
  }

  function handleReinscribir(inscripcion) {
    ejecutar(
      inscripcion,
      () => inscribirseRequest(inscripcion.cursoId),
      `Volviste a inscribirte en "${inscripcion.cursoNombre}"`,
      "No se pudo completar la inscripción"
    );
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando tus inscripciones...</p>;
  if (error) {
    return <Alert variant="error" title="No se pudieron cargar tus inscripciones">{error}</Alert>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold">Mis cursos</h1>
      <p className="text-xs text-slate-500 mb-6">Cursos en los que te has inscrito.</p>

      {accion && <Alert variant={accion.variant} title={accion.texto} className="mb-5" />}

      {inscripciones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          Aún no estás inscrito en ningún curso.{" "}
          <Link to="/cursos" className="font-semibold text-primary hover:underline">
            Explora el catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {inscripciones.map((ins) => {
            const ocupado = ocupandoId === ins.id;
            const badge = estadoBadge[ins.estado] ?? { variant: "neutral", label: ins.estado };
            return (
              <article
                key={ins.id}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/cursos/${ins.cursoId}`}
                      className="text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {ins.cursoNombre}
                    </Link>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <User size={12} />
                    {ins.docenteNombre}
                  </p>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      Inscrito el {ins.fechaInscripcion.slice(0, 10)}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Award size={12} />
                      Calificación final:{" "}
                      <span className="font-semibold text-slate-600">
                        {ins.calificacionFinal ?? "Sin calificar"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 px-4 pb-4">
                  <Link
                    to={`/cursos/${ins.cursoId}`}
                    className="flex-1 rounded-md border border-slate-200 py-2 text-center text-xs font-semibold hover:bg-slate-50"
                  >
                    {ins.estado === "ACTIVA" ? "Ver contenido" : "Ver detalle"}
                  </Link>

                  {ins.estado === "ACTIVA" && (
                    <button
                      onClick={() => handleCancelar(ins)}
                      disabled={ocupado}
                      className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <X size={12} />
                      {ocupado ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}

                  {ins.estado === "CANCELADA" && (
                    <button
                      onClick={() => handleReinscribir(ins)}
                      disabled={ocupado}
                      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40"
                    >
                      <RotateCcw size={12} />
                      {ocupado ? "Inscribiendo..." : "Volver a inscribirme"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}