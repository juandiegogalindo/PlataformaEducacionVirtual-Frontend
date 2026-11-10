import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Check, Pencil, Archive, RotateCcw, X } from "lucide-react";
import { verCursoRequest, archivarCursoRequest, activarCursoRequest } from "../../api/cursos";
import { inscribirseRequest, misCursosRequest, cancelarInscripcionRequest } from "../../api/inscripciones";
import { useAuthStore } from "../../auth/authStore";
import { ROLES, puedeGestionarCurso, esDocenteDelCurso } from "../../auth/roles";
import { textoSesion } from "../../utils/horarios";
import { mensajeError } from "../../utils/errores";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import LeccionesCurso from "../lecciones/LeccionesCurso";
import InscritosCurso from "../estudiantes/InscritosCurso";

function iniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function Tarjeta({ titulo, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      {titulo && <h2 className="text-xs font-semibold mb-3">{titulo}</h2>}
      {children}
    </section>
  );
}

function Fila({ etiqueta, children }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 py-2.5 text-xs first:border-t-0">
      <span className="text-slate-500">{etiqueta}</span>
      <span className="font-semibold text-right">{children}</span>
    </div>
  );
}

export default function CursoDetalle() {
  const { id } = useParams();
  return <DetalleCurso key={id} id={id} />;
}

function DetalleCurso({ id }) {
  const user = useAuthStore((state) => state.user);
  const rol = user?.rol;

  const [curso, setCurso] = useState(null);
  const [inscripcion, setInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accion, setAccion] = useState(null); // { variant, titulo, texto }
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
      .catch((err) => setError(mensajeError(err, "No se pudo cargar el curso")))
      .finally(() => setLoading(false));
  }, [id, rol, recarga]);

  async function ejecutar(accionFn, mensajeExito, mensajeFallo) {
    setAccion(null);
    setAccionLoading(true);
    try {
      await accionFn();
      setAccion({ variant: "success", titulo: mensajeExito });
      setRecarga((r) => r + 1);
    } catch (err) {
      // 409 = conflicto (p. ej. inscripción duplicada): advertencia en vez de error
      const variant = err.response?.status === 409 ? "warning" : "error";
      setAccion({ variant, titulo: mensajeError(err, mensajeFallo) });
    } finally {
      setAccionLoading(false);
    }
  }

  function handleInscribirse() {
    ejecutar(() => inscribirseRequest(Number(id)), "¡Te inscribiste correctamente!", "No se pudo completar la inscripción");
  }

  function handleCancelar() {
    ejecutar(() => cancelarInscripcionRequest(inscripcion.id), "Inscripción cancelada", "No se pudo cancelar la inscripción");
  }

  function handleArchivar() {
    if (!window.confirm("¿Archivar este curso? Dejará de aparecer en el catálogo de los estudiantes.")) return;
    ejecutar(() => archivarCursoRequest(id), "Curso archivado", "No se pudo archivar el curso");
  }

  function handleReactivar() {
    ejecutar(() => activarCursoRequest(id), "Curso reactivado", "No se pudo reactivar el curso");
  }

  if (loading) return <p className="text-sm text-slate-400">Cargando curso...</p>;
  if (error) return <Alert variant="error" title="No se pudo cargar el curso">{error}</Alert>;

  const cursoActivo = curso.estado === "ACTIVO";
  const puedeGestionar = puedeGestionarCurso(user, curso);
  const esEstudiante = rol === ROLES.ESTUDIANTE;

  const subtitulo = [
    curso.codigo,
    curso.creditos != null && `${curso.creditos} créditos`,
    `${curso.fechaInicio} – ${curso.fechaFin}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div>
      <h1 className="text-xl font-semibold">{curso.nombre}</h1>
      <p className="text-xs text-slate-500 mb-5">{subtitulo}</p>

      {accion && <Alert variant={accion.variant} title={accion.titulo} className="mb-4" />}

      {!cursoActivo && (
        <Alert variant="warning" title="Curso no disponible" className="mb-4">
          Este curso está {curso.estado === "ARCHIVADO" ? "archivado" : "inactivo"} y no admite nuevas inscripciones.
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] items-start">
        {/* Columna izquierda: información del curso */}
        <Tarjeta titulo="Descripción del curso">
          <p className="text-xs text-slate-500 mb-4">{curso.descripcion}</p>

          {curso.codigo && <Fila etiqueta="Código">{curso.codigo}</Fila>}
          {curso.creditos != null && <Fila etiqueta="Créditos">{curso.creditos}</Fila>}
          {curso.programa && <Fila etiqueta="Programa académico">{curso.programa}</Fila>}
          <Fila etiqueta="Fecha de inicio">{curso.fechaInicio}</Fila>
          <Fila etiqueta="Fecha de fin">{curso.fechaFin}</Fila>
          <Fila etiqueta="Cupo máximo">{curso.cupoMaximo}</Fila>
          <Fila etiqueta="Creado por">{curso.creadoPorNombre}</Fila>
          <Fila etiqueta="Estado">
            <Badge variant={cursoActivo ? "success" : "neutral"}>
              {cursoActivo ? (esEstudiante ? "Disponible" : "Activo") : "Archivado"}
            </Badge>
          </Fila>

          <h3 className="text-xs font-semibold mt-5 mb-2">Horario de clases</h3>
          {curso.horarios?.length > 0 ? (
            <ul className="flex flex-col gap-1 text-xs text-slate-600">
              {curso.horarios.map((sesion) => (
                <li key={`${sesion.diaSemana}-${sesion.horaInicio}`}>{textoSesion(sesion)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">Este curso aún no tiene horario registrado.</p>
          )}
        </Tarjeta>

        {/* Columna derecha */}
        <div className="flex flex-col gap-4">
          <Tarjeta titulo="Docente">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold grid place-items-center">
                {iniciales(curso.docenteNombre)}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">{curso.docenteNombre}</p>
                <p className="text-[11px] text-slate-500">{curso.docenteCorreo}</p>
              </div>
            </div>
          </Tarjeta>

          {esEstudiante && (inscripcion || cursoActivo) && (
            <Tarjeta titulo={inscripcion ? "Tu inscripción" : "Confirmar inscripción"}>
              {inscripcion ? (
                <>
                  <p className="text-xs text-slate-500 mb-4">Ya estás inscrito en este curso.</p>
                  <button
                    onClick={handleCancelar}
                    disabled={accionLoading}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={14} />
                    {accionLoading ? "Cancelando..." : "Cancelar inscripción"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-slate-500 mb-4">
                    Al confirmar quedará inscrito en este curso.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleInscribirse}
                      disabled={accionLoading}
                      className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:bg-primary/40"
                    >
                      <Check size={14} />
                      {accionLoading ? "Inscribiendo..." : "Confirmar inscripción"}
                    </button>
                    <Link
                      to="/cursos"
                      className="w-full text-center rounded-md border border-slate-200 py-2 text-xs font-semibold hover:bg-slate-50"
                    >
                      Cancelar
                    </Link>
                  </div>
                </>
              )}
            </Tarjeta>
          )}

          {puedeGestionar && (
            <Tarjeta titulo="Gestión del curso">
              <div className="flex flex-col gap-2">
                <Link
                  to={`/cursos/${curso.id}/editar`}
                  className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary py-2 text-xs font-semibold text-white hover:bg-primary-dark"
                >
                  <Pencil size={14} />
                  Editar curso
                </Link>
                {curso.estado === "ACTIVO" && (
                  <button
                    onClick={handleArchivar}
                    disabled={accionLoading}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md border border-red-200 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Archive size={14} />
                    {accionLoading ? "Archivando..." : "Archivar curso"}
                  </button>
                )}
                {curso.estado === "ARCHIVADO" && (
                  <button
                    onClick={handleReactivar}
                    disabled={accionLoading}
                    className="w-full flex items-center justify-center gap-1.5 rounded-md border border-slate-200 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    {accionLoading ? "Reactivando..." : "Reactivar curso"}
                  </button>
                )}
              </div>
            </Tarjeta>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <LeccionesCurso
          cursoId={curso.id}
          puedeGestionar={esDocenteDelCurso(user, curso)}
          inscrito={Boolean(inscripcion)}
        />

        {puedeGestionar && <InscritosCurso cursoId={curso.id} />}

        {/* Aquí irá <RecursosCurso /> (paquete de Miguel) */}
      </div>
    </div>
  );
}