import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../auth/authStore";
import { ROLES } from "../../auth/roles";
import { misCursosDocenteRequest } from "../../api/cursos";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import MisCalificaciones from "./MisCalificaciones";

export default function Calificaciones() {
  const rol = useAuthStore((state) => state.user?.rol);
  return rol === ROLES.ESTUDIANTE ? <MisCalificaciones /> : <CursosCalificaciones />;
}

function CursosCalificaciones() {
  const [datos, setDatos] = useState({ cursos: [], loading: true, error: "" });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let vigente = true;
    misCursosDocenteRequest().then(({ data }) => {
      if (vigente) setDatos({ cursos: data, loading: false, error: "" });
    }).catch((err) => {
      if (vigente) setDatos({ cursos: [], loading: false, error: mensajeError(err, "No se pudieron cargar tus cursos.") });
    });
    return () => { vigente = false; };
  }, [revision]);

  return <div><h1 className="text-xl font-semibold">Calificaciones</h1><p className="mb-6 text-xs text-slate-500">Selecciona un curso para revisar y calificar las entregas de tus estudiantes.</p>
    {datos.loading ? <p className="text-sm text-slate-400" role="status">Cargando cursos...</p> : datos.error ? <div><Alert variant="error" title={datos.error} /><button className="mt-3 text-xs font-semibold text-primary" onClick={() => { setDatos({ cursos: [], loading: true, error: "" }); setRevision((n) => n + 1); }}>Reintentar</button></div> : datos.cursos.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{datos.cursos.map((curso) => <Link key={curso.id} to={`/cursos/${curso.id}/calificaciones`} className="rounded-xl border border-slate-200 bg-white p-5 hover:border-primary"><h2 className="text-sm font-semibold">{curso.nombre}</h2><span className="mt-4 block text-xs font-semibold text-primary">Revisar entregas →</span></Link>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Todavía no tienes cursos para calificar.</div>}
  </div>;
}
