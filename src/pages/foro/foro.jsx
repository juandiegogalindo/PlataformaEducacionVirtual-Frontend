import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { listarMensajes, publicarMensaje } from "../../api/foro";
import { misCursosDocenteRequest } from "../../api/cursos";
import { misCursosRequest } from "../../api/inscripciones";
import { useAuthStore } from "../../auth/authStore";
import {
  contarRespuestas,
  esDocente,
  iniciales,
  tiempoRelativo,
  tituloDe,
} from "../../utils/foroUtils";

// Estados que sacan a un curso (o a una inscripción) de la lista de foros
const ESTADOS_INACTIVOS = ["ARCHIVADO", "ARCHIVADA", "INACTIVO", "INACTIVA", "CANCELADO", "CANCELADA"];

const estaActivo = (c) =>
  ![c.estado, c.estadoCurso, c.cursoEstado, c.estadoInscripcion, c.curso?.estado].some(
    (e) => typeof e === "string" && ESTADOS_INACTIVOS.includes(e.toUpperCase())
  );

export default function ForoPage() {
  const { cursoId } = useParams();
  const user = useAuthStore((s) => s.user);

  const [cursos, setCursos] = useState([]);
  const [cursosListos, setCursosListos] = useState(false);
  // Mensajes y error guardan el curso al que pertenecen: así nunca se muestran en otro curso
  const [datos, setDatos] = useState({ cursoId: null, lista: [] });
  const [errorInfo, setErrorInfo] = useState({ cursoId: null, texto: "" });
  const [nuevo, setNuevo] = useState(null); // null = cerrado, string = texto
  const [enviando, setEnviando] = useState(false);

  const cargando = datos.cursoId !== cursoId;
  const mensajes = datos.cursoId === cursoId ? datos.lista : [];
  const error = errorInfo.cursoId === cursoId ? errorInfo.texto : "";

  useEffect(() => {
    let cancelado = false;
    const pedirCursos = esDocente(user) ? misCursosDocenteRequest : misCursosRequest;
    pedirCursos()
      .then(({ data }) => {
        if (cancelado) return;
        // Se normalizan a id y nombre, y se descartan los archivados o cancelados
        const lista = data.filter(estaActivo).map((c) => ({
          id: c.cursoId ?? c.id,
          nombre: c.cursoNombre ?? c.nombre ?? c.titulo,
        }));
        setCursos(lista);
        setCursosListos(true);
      })
      .catch(() => {
        if (cancelado) return;
        setCursos([]);
        setCursosListos(true);
      });
    return () => { cancelado = true; };
  }, [user]);

  useEffect(() => {
    if (!cursoId) return;
    let cancelado = false;
    listarMensajes(cursoId)
      .then(({ data }) => {
        if (cancelado) return;
        const ordenados = [...data].sort(
          (a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion)
        );
        setDatos({ cursoId, lista: ordenados });
        setErrorInfo({ cursoId, texto: "" });
      })
      .catch((err) => {
        if (cancelado) return;
        setDatos({ cursoId, lista: [] });
        setErrorInfo({
          cursoId,
          texto:
            err.response?.status === 403
              ? "No tienes acceso al foro de este curso."
              : "No se pudo cargar el foro. Intenta de nuevo.",
        });
      });
    return () => { cancelado = true; };
  }, [cursoId]);

  const curso = cursos.find((c) => String(c.id) === String(cursoId));

  // Sin curso en la URL, o con un curso que ya no está disponible: ir al primer foro activo
  if (cursosListos && cursos.length > 0 && !curso) {
    return <Navigate to={`/foro/${cursos[0].id}`} replace />;
  }
  if (cursosListos && cursos.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold text-slate-900">Foro del curso</h1>
        <p className="mt-4 text-sm text-slate-600">
          No tienes cursos activos con foro disponible.
        </p>
      </div>
    );
  }

  async function publicar(e) {
    e.preventDefault();
    if (!nuevo?.trim()) return;
    setEnviando(true);
    try {
      const { data } = await publicarMensaje(cursoId, nuevo.trim());
      setDatos((prev) =>
        prev.cursoId === cursoId ? { cursoId, lista: [data, ...prev.lista] } : prev
      );
      setErrorInfo({ cursoId, texto: "" });
      setNuevo(null);
    } catch (err) {
      setErrorInfo({
        cursoId,
        texto:
          err.response?.status === 403
            ? "No tienes permiso para publicar en este foro."
            : "No se pudo publicar. Intenta de nuevo.",
      });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Foro del curso</h1>
          <p className="text-xs text-slate-500">{curso?.nombre}</p>
        </div>
        <button
          onClick={() => setNuevo("")}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva publicación
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Publicaciones del foro</h2>

          {nuevo !== null && (
            <form onSubmit={publicar} className="mb-4 rounded-lg border border-slate-200 p-3">
              <textarea
                autoFocus
                rows={3}
                value={nuevo}
                onChange={(e) => setNuevo(e.target.value)}
                placeholder="Escribe tu publicación. La primera línea se muestra como título."
                className="w-full resize-none rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNuevo(null)}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  disabled={enviando || !nuevo.trim()}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {enviando ? "Publicando…" : "Publicar"}
                </button>
              </div>
            </form>
          )}

          {cargando ? (
            <p className="py-6 text-center text-sm text-slate-500">Cargando publicaciones…</p>
          ) : mensajes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Aún no hay publicaciones. Usa “Nueva publicación” para abrir la conversación.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {mensajes.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/foro/${cursoId}/tema/${m.id}`}
                    className="flex items-center gap-3 py-3 hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-600 text-[10px] font-semibold text-white">
                      {iniciales(m.autorNombre)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {tituloDe(m.contenido)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {m.autorNombre} · {tiempoRelativo(m.fechaPublicacion)}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-slate-500">
                      {contarRespuestas(m)} respuestas
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Foros disponibles</h2>
          <ul className="space-y-1">
            {cursos.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/foro/${c.id}`}
                  className={`block rounded-md px-3 py-1.5 text-sm ${
                    String(c.id) === String(cursoId)
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}