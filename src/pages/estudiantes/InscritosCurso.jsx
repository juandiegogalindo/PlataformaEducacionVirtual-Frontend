import { Fragment, useEffect, useRef, useState } from "react";
import { listarInscritosRequest, verProgresoEstudianteRequest } from "../../api/estudiantes";
import { mensajeError } from "../../utils/errores";

function BarraAvance({ completadas, total }) {
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
  return (
    <div className="min-w-32">
      <div className="w-full h-2 bg-gray-200 rounded">
        <div className="h-2 bg-black rounded" style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {completadas} de {total} ({porcentaje} %)
      </p>
    </div>
  );
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
    if (detalleLoading) return <p className="text-gray-400">Cargando avance...</p>;
    if (detalleError) return <p className="text-red-500">{detalleError}</p>;
    if (!detalle) return null;
    if (detalle.detalle.length === 0) {
      return <p className="text-gray-500">Este curso aún no tiene lecciones.</p>;
    }
    return (
      <ul className="flex flex-col gap-1">
        {[...detalle.detalle]
          .sort((a, b) => a.orden - b.orden)
          .map((leccion) => (
            <li key={leccion.leccionId} className="flex items-center gap-2">
              <span className={leccion.completado ? "text-green-700" : "text-gray-400"}>
                {leccion.completado ? "✓" : "○"}
              </span>
              <span>{leccion.orden}. {leccion.leccionTitulo}</span>
              {leccion.fechaCompletado && (
                <span className="text-xs text-gray-500">{leccion.fechaCompletado.slice(0, 10)}</span>
              )}
            </li>
          ))}
      </ul>
    );
  }

  return (
    <section className="mt-8">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Estudiantes inscritos</h2>
        <label className="flex items-center gap-2 text-sm">
          Estado
          <select
            value={estado}
            onChange={(e) => cambiarEstado(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="">Todos</option>
            <option value="ACTIVA">Activas</option>
            <option value="CANCELADA">Canceladas</option>
          </select>
        </label>
      </div>

      {loading ? (
        <p className="text-gray-400">Cargando estudiantes...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : inscritos.length === 0 ? (
        <p className="text-gray-500">
          {estado ? "No hay inscripciones con ese estado." : "Aún no hay estudiantes inscritos en este curso."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-600">
                <th className="py-2 pr-4">Estudiante</th>
                <th className="py-2 pr-4">Programa</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4">Avance</th>
                <th className="py-2 pr-4">Nota final</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((inscrito) => {
                const abierto = abiertoId === inscrito.estudianteId;
                return (
                  <Fragment key={inscrito.inscripcionId}>
                    <tr className="border-b border-gray-200 align-top">
                      <td className="py-2 pr-4">
                        <p className="font-semibold">{inscrito.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {inscrito.correo} · {inscrito.codigoEstudiantil}
                        </p>
                      </td>
                      <td className="py-2 pr-4">
                        {inscrito.programaAcademico}
                        <p className="text-xs text-gray-500">Semestre {inscrito.semestre}</p>
                      </td>
                      <td className="py-2 pr-4">{inscrito.estadoInscripcion}</td>
                      <td className="py-2 pr-4">
                        <BarraAvance
                          completadas={inscrito.leccionesCompletadas}
                          total={inscrito.totalLecciones}
                        />
                      </td>
                      <td className="py-2 pr-4">{inscrito.calificacionFinal ?? "—"}</td>
                      <td className="py-2">
                        <button onClick={() => toggleDetalle(inscrito.estudianteId)} className="underline">
                          {abierto ? "Ocultar" : "Ver avance"}
                        </button>
                      </td>
                    </tr>
                    {abierto && (
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td colSpan={6} className="py-3 px-2">
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