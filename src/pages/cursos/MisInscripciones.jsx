import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { misCursosRequest, cancelarInscripcionRequest, inscribirseRequest } from "../../api/inscripciones";
import { mensajeError } from "../../utils/errores";

const estadoColor = {
  ACTIVA: "bg-green-900 text-green-300",
};
const estadoColorDefault = "bg-gray-700 text-gray-400";

export default function MisInscripciones() {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionMsg, setAccionMsg] = useState("");
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

  async function ejecutar(inscripcion, accion, mensajeExito, mensajeFallo) {
    setAccionMsg("");
    setOcupandoId(inscripcion.id);
    try {
      await accion();
      setAccionMsg(mensajeExito);
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccionMsg(mensajeError(err, mensajeFallo));
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

  if (loading) return <p className="text-gray-400">Cargando tus inscripciones...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mis inscripciones</h1>
      {accionMsg && <p className="text-sm mb-3">{accionMsg}</p>}

      {inscripciones.length === 0 ? (
        <p className="text-gray-500">
          Aún no estás inscrito en ningún curso.{" "}
          <Link to="/cursos" className="underline">Explora el catálogo</Link>
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {inscripciones.map((ins) => {
            const ocupado = ocupandoId === ins.id;
            return (
              <div key={ins.id} className="border border-gray-700 rounded p-4 flex justify-between items-center gap-4">
                <div>
                  <Link to={`/cursos/${ins.cursoId}`} className="font-semibold hover:underline">
                    {ins.cursoNombre}
                  </Link>
                  <p className="text-sm text-gray-500">Docente: {ins.docenteNombre}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Inscrito el {ins.fechaInscripcion.slice(0, 10)} · Calificación final:{" "}
                    {ins.calificacionFinal ?? "Sin calificar"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded ${estadoColor[ins.estado] || estadoColorDefault}`}>
                    {ins.estado}
                  </span>
                  {ins.estado === "ACTIVA" && (
                    <button
                      onClick={() => handleCancelar(ins)}
                      disabled={ocupado}
                      className="border border-red-700 text-red-700 px-3 py-1 rounded text-sm"
                    >
                      {ocupado ? "Cancelando..." : "Cancelar"}
                    </button>
                  )}
                  {ins.estado === "CANCELADA" && (
                    <button
                      onClick={() => handleReinscribir(ins)}
                      disabled={ocupado}
                      className="border border-black px-3 py-1 rounded text-sm"
                    >
                      {ocupado ? "Inscribiendo..." : "Volver a inscribirme"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}