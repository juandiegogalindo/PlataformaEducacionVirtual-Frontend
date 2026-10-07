import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { verCursoRequest } from "../../api/cursos";
import { inscribirseRequest, misCursosRequest, cancelarInscripcionRequest } from "../../api/inscripciones";
import { useAuthStore } from "../../auth/authStore";

export default function CursoDetalle() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const [curso, setCurso] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionMsg, setAccionMsg] = useState("");
  const [accionLoading, setAccionLoading] = useState(false);

  function cargarDatos() {
    setLoading(true);
    Promise.all([verCursoRequest(id), misCursosRequest()])
      .then(([cursoRes, misCursosRes]) => {
        setCurso(cursoRes.data);
        const yaInscrito = misCursosRes.data.find(
          (i) => i.cursoId === Number(id) && i.estado === "ACTIVA"
        );
        setInscripcion(yaInscrito || null);
      })
      .catch(() => setError("No se pudo cargar el curso"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    cargarDatos();
  }, [id]);

  async function handleInscribirse() {
    setAccionMsg("");
    setAccionLoading(true);
    try {
      await inscribirseRequest(Number(id));
      setAccionMsg("¡Te inscribiste correctamente!");
      cargarDatos();
    } catch (err) {
      setAccionMsg(err.response?.data?.mensaje || "No se pudo completar la inscripción");
    } finally {
      setAccionLoading(false);
    }
  }

  async function handleCancelar() {
    setAccionMsg("");
    setAccionLoading(true);
    try {
      await cancelarInscripcionRequest(inscripcion.id);
      setAccionMsg("Inscripción cancelada");
      cargarDatos();
    } catch (err) {
      setAccionMsg(err.response?.data?.mensaje || "No se pudo cancelar la inscripción");
    } finally {
      setAccionLoading(false);
    }
  }

  if (loading) return <p className="text-gray-400">Cargando curso...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <Link to="/cursos" className="text-sm text-gray-400 hover:underline">
        &larr; Volver al catálogo
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{curso.nombre}</h1>
      <p className="text-gray-400 mb-4">{curso.descripcion}</p>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <p><span className="text-gray-500">Docente:</span> {curso.docenteNombre} ({curso.docenteCorreo})</p>
        <p><span className="text-gray-500">Creado por:</span> {curso.creadoPorNombre}</p>
        <p><span className="text-gray-500">Fecha inicio:</span> {curso.fechaInicio}</p>
        <p><span className="text-gray-500">Fecha fin:</span> {curso.fechaFin}</p>
        <p><span className="text-gray-500">Cupo máximo:</span> {curso.cupoMaximo}</p>
        <p><span className="text-gray-500">Estado:</span> {curso.estado}</p>
      </div>

      {user?.rol === "Estudiante" && (
        <div>
          {accionMsg && <p className="text-sm mb-2">{accionMsg}</p>}
          {inscripcion ? (
            <button
              onClick={handleCancelar}
              disabled={accionLoading}
              className="bg-red-900 text-red-300 px-4 py-2 rounded"
            >
              {accionLoading ? "Cancelando..." : "Cancelar inscripción"}
            </button>
          ) : (
            <button
              onClick={handleInscribirse}
              disabled={accionLoading}
              className="bg-white text-black px-4 py-2 rounded font-semibold"
            >
              {accionLoading ? "Inscribiendo..." : "Inscribirme"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}