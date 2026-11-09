import { Link } from "react-router-dom";
import { textoSesion } from "../../utils/horarios";

const estadoColor = {
  ACTIVO: "bg-green-900 text-green-300",
  ARCHIVADO: "bg-gray-700 text-gray-400",
};

export default function TarjetaCurso({ curso, puedeGestionar, ocupado, onArchivar, onReactivar }) {
  return (
    <div className="border border-gray-700 rounded flex flex-col">
      <Link to={`/cursos/${curso.id}`} className="p-4 rounded hover:bg-gray-100 transition">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-semibold">{curso.nombre}</h2>
          <span className={`text-xs px-2 py-1 rounded ${estadoColor[curso.estado] || "bg-gray-700 text-gray-400"}`}>
            {curso.estado}
          </span>
        </div>
        <p className="text-sm text-gray-400 mb-2">{curso.descripcion}</p>
        <p className="text-sm">Docente: {curso.docenteNombre}</p>
        {curso.horarios?.length > 0 && (
          <p className="text-xs text-gray-600 mt-1">
            {curso.horarios.map((sesion) => textoSesion(sesion)).join(" · ")}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {curso.fechaInicio} – {curso.fechaFin} · Cupo: {curso.cupoMaximo}
        </p>
      </Link>

      {puedeGestionar && (
        <div className="flex gap-4 px-4 pb-3 text-sm">
          <Link to={`/cursos/${curso.id}/editar`} className="underline">
            Editar
          </Link>
          {curso.estado === "ACTIVO" && (
            <button onClick={() => onArchivar(curso)} disabled={ocupado} className="text-red-700 underline">
              {ocupado ? "Archivando..." : "Archivar"}
            </button>
          )}
          {curso.estado === "ARCHIVADO" && (
            <button onClick={() => onReactivar(curso)} disabled={ocupado} className="underline">
              {ocupado ? "Reactivando..." : "Reactivar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}