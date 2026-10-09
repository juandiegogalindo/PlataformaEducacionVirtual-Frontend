import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { verCursoRequest, archivarCursoRequest } from "../../api/cursos";
import { inscribirseRequest, misCursosRequest, cancelarInscripcionRequest } from "../../api/inscripciones";
import { useAuthStore } from "../../auth/authStore";
import { ROLES, puedeGestionarCurso, esDocenteDelCurso } from "../../auth/roles";
import LeccionesCurso from "../lecciones/LeccionesCurso";

export default function CursoDetalle() {
  const { id } = useParams();
  return <DetalleCurso key={id} id={id} />;
}

function DetalleCurso({ id }) {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const rol = user?.rol;

  const [curso, setCurso] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accionMsg, setAccionMsg] = useState("");
  const [accionLoading, setAccionLoading] = useState(false);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    const cursoPromise = verCursoRequest(id);
    const misCursosPromise =
      rol === ROLES.ESTUDIANTE ? misCursosRequest() : Promise.resolve({ data: [] });

    Promise.all([cursoPromise, misCursosPromise])
      .then(([cursoRes, misCursosRes]) => {
        setError("");
        setCurso(cursoRes.data);
        const yaInscrito = misCursosRes.data.find(
          (i) => i.cursoId === Number(id) && i.estado === "ACTIVA"
        );
        setInscripcion(yaInscrito || null);
      })
      .catch(() => setError("No se pudo cargar el curso"))
      .finally(() => setLoading(false));
  }, [id, rol, recarga]);

  async function handleInscribirse() {
    setAccionMsg("");
    setAccionLoading(true);
    try {
      await inscribirseRequest(Number(id));
      setAccionMsg("¡Te inscribiste correctamente!");
      setRecarga((r) => r + 1);
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
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccionMsg(err.response?.data?.mensaje || "No se pudo cancelar la inscripción");
    } finally {
      setAccionLoading(false);
    }
  }

  async function handleArchivar() {
    if (!window.confirm("¿Archivar este curso? Dejará de aparecer en el catálogo de los estudiantes.")) return;
    setAccionMsg("");
    setAccionLoading(true);
    try {
      await archivarCursoRequest(id);
      navigate("/cursos");
    } catch (err) {
      setAccionMsg(err.response?.data?.mensaje || "No se pudo archivar el curso");
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

      {accionMsg && <p className="text-sm mb-3">{accionMsg}</p>}

      {puedeGestionarCurso(user, curso) && (
        <div className="flex gap-3">
          <Link to={`/cursos/${curso.id}/editar`} className="border border-black px-4 py-2 rounded">
            Editar curso
          </Link>
          {curso.estado === "ACTIVO" && (
            <button
              onClick={handleArchivar}
              disabled={accionLoading}
              className="bg-red-700 text-white px-4 py-2 rounded"
            >
              {accionLoading ? "Archivando..." : "Archivar curso"}
            </button>
          )}
        </div>
      )}

      {rol === ROLES.ESTUDIANTE && (
        <div>
          {inscripcion ? (
            <button
              onClick={handleCancelar}
              disabled={accionLoading}
              className="bg-red-700 text-white px-4 py-2 rounded"
            >
              {accionLoading ? "Cancelando..." : "Cancelar inscripción"}
            </button>
          ) : (
            <button
              onClick={handleInscribirse}
              disabled={accionLoading}
              className="bg-black text-white px-4 py-2 rounded font-semibold"
            >
              {accionLoading ? "Inscribiendo..." : "Inscribirme"}
            </button>
          )}
        </div>
      )}

      <LeccionesCurso
        cursoId={curso.id}
        puedeGestionar={esDocenteDelCurso(user, curso)}
        inscrito={Boolean(inscripcion)}
      />

      {/* Aquí irá <RecursosCurso /> (paquete de Miguel) */}
    </div>
  );
}