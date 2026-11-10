import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
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
import Alert from "../../components/ui/Alert";
import Input, { Select } from "../../components/ui/Input";
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

function Vacio({ children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
      {children}
    </div>
  );
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
  const [accion, setAccion] = useState(null); // { variant, texto }
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

  async function ejecutar(curso, accionFn, mensajeExito) {
    setAccion(null);
    setOcupandoId(curso.id);
    try {
      await accionFn();
      setAccion({ variant: "success", texto: mensajeExito });
      setRecarga((r) => r + 1);
    } catch (err) {
      setAccion({ variant: "error", texto: mensajeError(err, "No se pudo completar la acción") });
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

  const titulo = esDocente ? "Mis cursos" : esGestion ? "Gestión de cursos" : "Catálogo de cursos";

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">{titulo}</h1>
          <p className="text-xs text-slate-500">Cursos con su estado de disponibilidad.</p>
        </div>
        {ROLES_GESTION_CURSOS.includes(rol) && (
          <Link
            to="/cursos/nuevo"
            className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            <Plus size={14} />
            Nuevo curso
          </Link>
        )}
      </div>

      <div className="flex flex-wrap items-end gap-4 mb-5">
        {cursos.length > 0 && (
          <Input
            icon={Search}
            type="search"
            placeholder="Buscar por nombre de curso o docente"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-md"
          />
        )}
        {conFiltroEstado && (
          <Select label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} className="w-40">
            <option value="">Todos</option>
            <option value="ACTIVO">Activos</option>
            <option value="ARCHIVADO">Archivados</option>
          </Select>
        )}
      </div>

      {accion && (
        <Alert variant={accion.variant} title={accion.texto} className="mb-5" />
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando cursos...</p>
      ) : error ? (
        <Alert variant="error" title="No se pudieron cargar los cursos">
          {error}
        </Alert>
      ) : cursos.length === 0 ? (
        <Vacio>{mensajeVacio(rol, estado)}</Vacio>
      ) : cursosFiltrados.length === 0 ? (
        <Vacio>
          No se encontraron cursos para "{busqueda}".{" "}
          <button onClick={() => setBusqueda("")} className="font-semibold text-primary hover:underline">
            Limpiar búsqueda
          </button>
        </Vacio>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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