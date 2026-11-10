import { Link } from "react-router-dom";
import { User, Clock, CalendarDays, Users, Bookmark } from "lucide-react";
import Badge from "../../components/ui/Badge";
import { textoSesion } from "../../utils/horarios";

export default function TarjetaCurso({
  curso,
  puedeGestionar,
  ocupado,
  onArchivar,
  onReactivar,
  onInscribir, // opcional: solo si pasas este handler aparece "Inscribirme"
  inscrito = false, // opcional
}) {
  const activo = curso.estado === "ACTIVO";
  const puedeInscribirse = onInscribir && activo && !inscrito;

  return (
    <article className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      {curso.codigo && (
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500">{curso.codigo}</span>
          <Bookmark size={14} className="text-slate-400" />
        </div>
      )}

      <div className="p-4 flex-1">
        <h2 className="text-sm font-semibold">{curso.nombre}</h2>

        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
          <User size={12} />
          {curso.docenteNombre}
        </p>

        {curso.descripcion && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{curso.descripcion}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {curso.creditos != null && <Badge>{curso.creditos} créditos</Badge>}
          <Badge>
            <Users size={10} className="inline mr-1 -mt-0.5" />
            Cupo: {curso.cupoMaximo}
          </Badge>
          {inscrito ? (
            <Badge variant="info">Inscrito</Badge>
          ) : (
            <Badge variant={activo ? "success" : "neutral"}>
              {activo ? (puedeGestionar ? "Activo" : "Disponible") : "Archivado"}
            </Badge>
          )}
        </div>

        <div className="mt-3 space-y-1 text-[11px] text-slate-400">
          <p className="flex items-center gap-1.5">
            <CalendarDays size={12} />
            {curso.fechaInicio} – {curso.fechaFin}
          </p>
          {curso.horarios?.length > 0 && (
            <p className="flex items-start gap-1.5">
              <Clock size={12} className="mt-0.5 shrink-0" />
              {curso.horarios.map((sesion) => textoSesion(sesion)).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 px-4 pb-4">
        <Link
          to={`/cursos/${curso.id}`}
          className="flex-1 text-center rounded-md border border-slate-200 py-2 text-xs font-semibold hover:bg-slate-50"
        >
          Ver detalle
        </Link>

        {onInscribir && (
          <button
            onClick={() => onInscribir(curso)}
            disabled={!puedeInscribirse || ocupado}
            className="flex-1 rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40 disabled:cursor-not-allowed"
          >
            Inscribirme
          </button>
        )}

        {puedeGestionar && (
          <>
            <Link
              to={`/cursos/${curso.id}/editar`}
              className="flex-1 text-center rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              Editar
            </Link>
            {activo && (
              <button
                onClick={() => onArchivar(curso)}
                disabled={ocupado}
                className="rounded-md border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {ocupado ? "Archivando..." : "Archivar"}
              </button>
            )}
            {curso.estado === "ARCHIVADO" && (
              <button
                onClick={() => onReactivar(curso)}
                disabled={ocupado}
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                {ocupado ? "Reactivando..." : "Reactivar"}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}