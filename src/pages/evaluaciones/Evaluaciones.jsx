import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useAuthStore } from "../../auth/authStore";
import { ROLES } from "../../auth/roles";
import { misCursosDocenteRequest, listarCursosGestionRequest } from "../../api/cursos";
import { misCursosRequest } from "../../api/inscripciones";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";

export default function Evaluaciones() {
  const rol = useAuthStore((state) => state.user?.rol);
  const [datos, setDatos] = useState({ cursos: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let vigente = true;
    const peticion = rol === ROLES.ESTUDIANTE ? misCursosRequest()
      : rol === ROLES.DOCENTE ? misCursosDocenteRequest() : listarCursosGestionRequest();
    peticion.then(({ data }) => {
      const cursos = rol === ROLES.ESTUDIANTE
        ? data.filter((inscripcion) => inscripcion.estado === "ACTIVA").map((inscripcion) => ({ id: inscripcion.cursoId, nombre: inscripcion.cursoNombre, docenteNombre: inscripcion.docenteNombre }))
        : data;
      if (vigente) setDatos({ cursos, loading: false, error: "" });
    }).catch((err) => {
      if (vigente) setDatos({ cursos: [], loading: false, error: mensajeError(err, "No se pudieron cargar los cursos.") });
    });
    return () => { vigente = false; };
  }, [rol, revision]);

  return (
    <div>
      <h1 className="text-xl font-semibold">Evaluaciones</h1>
      <p className="mb-6 text-xs text-slate-500">Selecciona un curso para consultar sus tareas y exámenes.</p>
      {datos.loading ? <p className="text-sm text-slate-400" role="status">Cargando cursos...</p> : datos.error ? (
        <div><Alert variant="error" title={datos.error} /><button className="mt-3 text-xs font-semibold text-primary" onClick={() => { setDatos({ cursos: [], loading: true, error: "" }); setRevision((n) => n + 1); }}>Reintentar</button></div>
      ) : datos.cursos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          <p>{rol === ROLES.ESTUDIANTE ? "No tienes inscripciones activas para consultar evaluaciones." : "No hay cursos disponibles para consultar evaluaciones."}</p>
          <Link to="/cursos" className="mt-3 inline-block text-xs font-semibold text-primary">Ver cursos</Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{datos.cursos.map((curso) => (
          <Link key={curso.id} to={`/cursos/${curso.id}/evaluaciones`} className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
            <ClipboardList size={20} className="mb-3 text-primary" />
            <h2 className="text-sm font-semibold">{curso.nombre}</h2>
            <p className="mt-1 text-xs text-slate-500">{curso.docenteNombre}</p>
            <span className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary">Ver evaluaciones <ArrowRight size={14} /></span>
          </Link>
        ))}</div>
      )}
    </div>
  );
}
