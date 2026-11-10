import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { editarMensaje, eliminarMensaje, listarMensajes, publicarMensaje } from "../../api/foro";
import { useAuthStore } from "../../auth/authStore"; // AJUSTAR ruta
import {
  buscarMensaje, contarRespuestas, iniciales, limpiarRol, puedeEditar, puedeEliminar,
  tiempoRelativo, tituloDe,
} from "../../utils/foroUtils";

function Mensaje({ m, nivel, user, onResponder, onEditar, onEliminar, editandoId, setEditandoId }) {
  const [texto, setTexto] = useState(m.contenido);
  const esDoc = limpiarRol(m.autorRol) === "Docente";
  const editando = editandoId === m.id;

  return (
    <>
      <article className={`rounded-lg border border-slate-200 bg-white p-4 ${nivel ? "ml-8" : ""}`}>
        <header className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-[10px] font-semibold text-white">
            {iniciales(m.autorNombre)}
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium text-slate-900">
              {m.autorNombre}
              {esDoc && (
                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                  Docente
                </span>
              )}
            </p>
            <p className="text-xs text-slate-500">
              {tiempoRelativo(m.fechaPublicacion)}
              {m.editado && " · editado"}
            </p>
          </div>
        </header>

        {editando ? (
          <div className="mt-3">
            <textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              className="w-full resize-none rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onEditar(m, texto.trim())}
                disabled={!texto.trim()}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Guardar cambios
              </button>
              <button
                onClick={() => { setEditandoId(null); setTexto(m.contenido); }}
                className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{m.contenido}</p>
        )}

        {!editando && (
          <footer className="mt-3 flex gap-4 text-xs">
            <button onClick={() => onResponder(m)} className="font-medium text-blue-600 hover:underline">
              Responder
            </button>
            {puedeEditar(m, user) && (
              <button onClick={() => setEditandoId(m.id)} className="text-slate-500 hover:underline">
                Editar
              </button>
            )}
            {puedeEliminar(m, user) && (
              <button onClick={() => onEliminar(m)} className="text-red-600 hover:underline">
                Eliminar
              </button>
            )}
          </footer>
        )}
      </article>

      {(m.respuestas || []).map((r) => (
        <Mensaje
          key={r.id}
          m={r}
          nivel={Math.min(nivel + 1, 3)}
          user={user}
          onResponder={onResponder}
          onEditar={onEditar}
          onEliminar={onEliminar}
          editandoId={editandoId}
          setEditandoId={setEditandoId}
        />
      ))}
    </>
  );
}

export default function ForoHilo() {
  const { cursoId, mensajeId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [arbol, setArbol] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [recarga, setRecarga] = useState(0); // se incrementa para volver a pedir los mensajes
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [respondiendoA, setRespondiendoA] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const recargar = () => setRecarga((n) => n + 1);

  useEffect(() => {
    let cancelado = false;
    listarMensajes(cursoId)
      .then(({ data }) => {
        if (cancelado) return;
        setArbol(data);
        setError("");
      })
      .catch(() => {
        if (!cancelado) setError("No se pudo cargar la publicación. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => { cancelado = true; };
  }, [cursoId, recarga]);

  const raiz = buscarMensaje(arbol, Number(mensajeId));
  const destino = respondiendoA || raiz;

  async function responder(e) {
    e.preventDefault();
    if (!texto.trim() || !destino) return;
    setEnviando(true);
    try {
      await publicarMensaje(cursoId, texto.trim(), destino.id);
      setTexto("");
      setRespondiendoA(null);
      setAviso("Tu respuesta fue publicada y es visible para los participantes autorizados.");
      recargar();
    } catch {
      setError("No se pudo publicar tu respuesta. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function editar(m, contenido) {
    try {
      await editarMensaje(cursoId, m.id, contenido);
      setEditandoId(null);
      setAviso("Cambios guardados.");
      recargar();
    } catch {
      setError("No tienes permiso para editar este mensaje o ocurrió un error.");
    }
  }

  async function eliminar(m) {
    if (!window.confirm("¿Eliminar este mensaje? Esta acción no se puede deshacer.")) return;
    try {
      await eliminarMensaje(cursoId, m.id);
      if (m.id === raiz.id) {
        navigate(`/foro/${cursoId}`);
        return;
      }
      setAviso("Mensaje eliminado.");
      recargar();
    } catch {
      setError("No se pudo eliminar el mensaje.");
    }
  }

  if (cargando) return <p className="p-6 text-sm text-slate-500">Cargando…</p>;
  if (!raiz) {
    return (
      <p className="p-6 text-sm text-slate-600">
        Esta publicación ya no existe.{" "}
        <Link to={`/foro/${cursoId}`} className="text-blue-600 underline">Volver al foro</Link>
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-slate-900">{tituloDe(raiz.contenido)}</h1>
      <p className="text-xs text-slate-500">{contarRespuestas(raiz)} respuestas</p>
      <nav className="mt-2 text-[11px] text-slate-400">
        <Link to={`/foro/${cursoId}`} className="hover:underline">Foro</Link> / Tema
      </nav>

      {aviso && (
        <p className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
          ✓ {aviso}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <Mensaje
            m={raiz}
            nivel={0}
            user={user}
            onResponder={setRespondiendoA}
            onEditar={editar}
            onEliminar={eliminar}
            editandoId={editandoId}
            setEditandoId={setEditandoId}
          />
        </div>

        <form onSubmit={responder} className="h-fit rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">
            {respondiendoA ? `Respuesta a ${respondiendoA.autorNombre}` : "Respuesta"}
          </h2>
          <textarea
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escriba su aporte o respuesta..."
            className="mt-2 w-full resize-none rounded-md border border-slate-200 p-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => { setTexto(""); setRespondiendoA(null); }}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
            >
              Cancelar
            </button>
            <button
              disabled={enviando || !texto.trim()}
              className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {enviando ? "Publicando…" : "Publicar respuesta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}