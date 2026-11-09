import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  listarCursosRequest,
  misCursosDocenteRequest,
  listarCursosGestionRequest,
  archivarCursoRequest,
  activarCursoRequest,
} from "../../api/cursos";
import { useAuthStore } from "../../auth/authStore";
import { ROLES, ROLES_GESTION_CURSOS, esCoordinadorOAdmin, puedeGestionarCurso } from "../../auth/roles";
import { mensajeError } from "../../utils/errores";
import TarjetaCurso from "./TarjetaCurso";

function normalizar(texto) {
  return (texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mensajeVacio(rol, estado) {
  if (estado) return "No hay cursos con ese estado.";
  if (rol === ROLES.DOCENTE) return "Aún no tienes cursos. Crea el primero con el botón «Nuevo curso».";
  if (rol === ROLES.ESTUDIANTE) return "No hay cursos disponibles por ahora.";
  return "Todavía no hay cursos registrados.";
}

export default function Cursos() {
  const user = useAuthStore((state) => state.user);
  const rol = user?.rol;
  const esDocente = rol === ROLES.DOCENTE;
  const esGestion = esCoordinadorOAdmin(user);
  const conFiltroEstado = esDocente || esGestion;

  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [accionMsg, setAccionMsg] = useState("");
  const [ocupandoId, setOcupandoId] = useState(null);

  useEffect(() => {
    let cancelado = false;

    let peticion;
    if (esDocente) peticion = misCursosDocenteRequest(estado);
    else if (esGestion) peticion = listarCursosGestionRequest(estado);
    else peticion = listarCursosRequest();

    peticion
      .then((res) => {
        if (cancelado) return;
        setError("");
        setCursos(res.data);
      })
      .catch((err) => {
        if (!cancelado) setError(mensajeError(err, "No se pudieron cargar los cursos"));
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [esDocente, esGestion, estado, recarga]);

  async function ejecutar(curso, accion, mensajeExito) {
    setAccionMsg("");
    setOcupandoId(curso.id);
    try {
      await accion();
      setAccionMsg(mensajeExito);
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccionMsg(mensajeError(err, "No se pudo completar la acción"));
    } finally {
      setOcupandoId(null);
    }
  }

  function handleArchivar(curso) {
    if (!window.confirm(`¿Archivar "${curso.nombre}"? Dejará de aparecer en el catálogo de los estudiantes.`)) return;
    ejecutar(curso, () => archivarCursoRequest(curso.id), "Curso archivado");
  }

  function handleReactivar(curso) {
    ejecutar(curso, () => activarCursoRequest(curso.id), "Curso reactivado");
  }

  const termino = normalizar(busqueda.trim());
  const cursosFiltrados = cursos.filter(
    (curso) =>
      normalizar(curso.nombre).includes(termino) ||
      normalizar(curso.docenteNombre).includes(termino)
  );

  const titulo = esDocente ? "Mis cursos" : esGestion ? "Gestión de cursos" : "Catálogo de Cursos";

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        {ROLES_GESTION_CURSOS.includes(rol) && (
          <Link to="/cursos/nuevo" className="bg-black text-white px-4 py-2 rounded font-semibold">
            Nuevo curso
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {cursos.length > 0 && (
          <input
            type="search"
            placeholder="Buscar por nombre de curso o docente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full max-w-md"
          />
        )}
        {conFiltroEstado && (
          <label className="flex items-center gap-2 text-sm">
            Estado
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activos</option>
              <option value="ARCHIVADO">Archivados</option>
            </select>
          </label>
        )}
      </div>

      {accionMsg && <p className="text-sm mb-3">{accionMsg}</p>}

      {loading ? (
        <p className="text-gray-400">Cargando cursos...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : cursos.length === 0 ? (
        <p className="text-gray-500">{mensajeVacio(rol, estado)}</p>
      ) : cursosFiltrados.length === 0 ? (
        <p className="text-gray-500">
          No se encontraron cursos para "{busqueda}".{" "}
          <button onClick={() => setBusqueda("")} className="underline">
            Limpiar búsqueda
          </button>
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursosFiltrados.map((curso) => (
            <TarjetaCurso
              key={curso.id}
              curso={curso}
              puedeGestionar={puedeGestionarCurso(user, curso)}
              ocupado={ocupandoId === curso.id}
              onArchivar={handleArchivar}
              onReactivar={handleReactivar}
            />
          ))}
        </div>
      )}
    </div>
  );
}