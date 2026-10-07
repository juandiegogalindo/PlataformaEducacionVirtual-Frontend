import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listarCursosRequest } from "../../api/cursos";
import { useAuthStore } from "../../auth/authStore";
import { ROLES, ROLES_GESTION_CURSOS } from "../../auth/roles";

const estadoColor = {
  ACTIVO: "bg-green-900 text-green-300",
  ARCHIVADO: "bg-gray-700 text-gray-400",
};

export default function Cursos() {
  const user = useAuthStore((state) => state.user);
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listarCursosRequest()
      .then((res) => {
        let lista = res.data;
        if (user?.rol === ROLES.DOCENTE) {
          lista = lista.filter((curso) => curso.docenteCorreo === user.correo);
        } else if (user?.rol === ROLES.ESTUDIANTE) {
          lista = lista.filter((curso) => curso.estado === "ACTIVO");
        }
        setCursos(lista);
      })
      .catch(() => setError("No se pudieron cargar los cursos"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <p className="text-gray-400">Cargando cursos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          {user?.rol === ROLES.DOCENTE ? "Mis cursos" : "Catálogo de Cursos"}
        </h1>
        {ROLES_GESTION_CURSOS.includes(user?.rol) && (
          <Link to="/cursos/nuevo" className="bg-black text-white px-4 py-2 rounded font-semibold">
            Nuevo curso
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <Link
            key={curso.id}
            to={`/cursos/${curso.id}`}
            className="border border-gray-700 rounded p-4 hover:bg-gray-900 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-semibold">{curso.nombre}</h2>
              <span className={`text-xs px-2 py-1 rounded ${estadoColor[curso.estado]}`}>
                {curso.estado}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-2">{curso.descripcion}</p>
            <p className="text-sm">Docente: {curso.docenteNombre}</p>
            <p className="text-xs text-gray-500 mt-1">
              {curso.fechaInicio} – {curso.fechaFin} · Cupo: {curso.cupoMaximo}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}