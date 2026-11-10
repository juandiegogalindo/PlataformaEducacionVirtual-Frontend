import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  listarRecursosRequest,
  crearRecursoRequest,
  actualizarRecursoRequest,
  eliminarRecursoRequest,
} from "../../api/recursosBibliograficos";
import { useAuthStore } from "../../auth/authStore";
import { ROLES } from "../../auth/roles";

const formularioInicial = {
  titulo: "",
  autor: "",
  anioPublicacion: "",
  tipoRecurso: "LIBRO",
  enlace: "",
};

const ICONOS = {
  libro: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  candado: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
};

const TONOS = {
  ambar: "bg-amber-50 text-amber-500",
  gris: "bg-slate-100 text-slate-500",
};

// Mismo lenguaje visual que "Este curso aún no tiene contenido publicado"
function EstadoVacio({ icono, tono, titulo, descripcion, children }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${TONOS[tono]}`}>
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {ICONOS[icono]}
        </svg>
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{titulo}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{descripcion}</p>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function RecursosBibliograficos({ cursoId: cursoIdProp }) {
  const params = useParams();
  const cursoId = cursoIdProp ?? params.cursoId;
  const user = useAuthStore((s) => s.user);

  // Los estudiantes consultan; docentes y demás roles administran
  const esEstudiante = user?.rol === ROLES.ESTUDIANTE;

  const [formulario, setFormulario] = useState(formularioInicial);
  const [recursoEditando, setRecursoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // Resultado de la carga, atado al curso: fallo = null | "sin-acceso" | "error"
  const [resultado, setResultado] = useState({ cursoId: null, recursos: [], fallo: null });
  const [recarga, setRecarga] = useState(0); // se incrementa para volver a pedir la lista
  const [error, setError] = useState("");

  const cargando = Boolean(cursoId) && resultado.cursoId !== cursoId;
  const recursos = resultado.cursoId === cursoId ? resultado.recursos : [];
  const fallo = resultado.cursoId === cursoId ? resultado.fallo : null;

  const errorCurso = cursoId ? "" : "No se encontró el identificador del curso.";
  const errorCarga = fallo === "error" ? "No fue posible cargar los recursos bibliográficos." : "";
  const mensajeError = errorCurso || error || errorCarga;

  const puedeGestionar = !esEstudiante && fallo !== "sin-acceso";

  const recargar = () => setRecarga((n) => n + 1);

  useEffect(() => {
    if (!cursoId) return;

    let cancelado = false;
    listarRecursosRequest(cursoId)
      .then((respuesta) => {
        if (cancelado) return;
        setResultado({ cursoId, recursos: respuesta.data, fallo: null });
        setError("");
      })
      .catch((err) => {
        if (cancelado) return;
        setResultado({
          cursoId,
          recursos: [],
          fallo: err.response?.status === 403 ? "sin-acceso" : "error",
        });
      });

    return () => {
      cancelado = true;
    };
  }, [cursoId, recarga]);

  function manejarCambio(e) {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  }

  function abrirFormulario(recurso = null) {
    if (recurso) {
      setRecursoEditando(recurso);

      setFormulario({
        titulo: recurso.titulo || "",
        autor: recurso.autor || "",
        anioPublicacion: recurso.anioPublicacion || "",
        tipoRecurso: recurso.tipoRecurso || "LIBRO",
        enlace: recurso.enlace || "",
      });
    } else {
      setRecursoEditando(null);
      setFormulario(formularioInicial);
    }

    setMostrarFormulario(true);
  }

  async function guardarRecurso(e) {
    e.preventDefault();

    try {
      setError("");

      const datos = {
        ...formulario,
        anioPublicacion: formulario.anioPublicacion
          ? Number(formulario.anioPublicacion)
          : null,
      };

      if (recursoEditando) {
        await actualizarRecursoRequest(cursoId, recursoEditando.id, datos);
      } else {
        await crearRecursoRequest(cursoId, datos);
      }

      setMostrarFormulario(false);
      setFormulario(formularioInicial);
      setRecursoEditando(null);

      recargar();
    } catch {
      setError("No fue posible guardar el recurso. Verifica los datos.");
    }
  }

  async function eliminarRecurso(recursoId) {
    if (!window.confirm("¿Deseas eliminar este recurso?")) return;

    try {
      setError("");

      await eliminarRecursoRequest(cursoId, recursoId);
      recargar();
    } catch {
      setError("No fue posible eliminar el recurso.");
    }
  }

  function contenido() {
    if (cargando) {
      return (
        <p className="p-6 text-center text-xs text-slate-500">Cargando recursos...</p>
      );
    }

    if (fallo === "sin-acceso") {
      return (
        <EstadoVacio
          icono="candado"
          tono="gris"
          titulo="Recursos disponibles para inscritos"
          descripcion={
            esEstudiante
              ? "Inscríbete a este curso desde el catálogo para consultar su bibliografía."
              : "No tienes acceso a los recursos de este curso."
          }
        />
      );
    }

    if (fallo === "error") {
      return (
        <div className="flex justify-center p-6">
          <button
            onClick={recargar}
            className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (recursos.length === 0) {
      return (
        <EstadoVacio
          icono="libro"
          tono="ambar"
          titulo="Este curso aún no tiene recursos bibliográficos"
          descripcion={
            puedeGestionar
              ? "Agrega el primer libro, artículo o enlace de apoyo para tus estudiantes."
              : "El docente publicará libros, artículos y enlaces de apoyo próximamente."
          }
        >
          {puedeGestionar && (
            <button
              onClick={() => abrirFormulario()}
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              + Agregar el primer recurso
            </button>
          )}
        </EstadoVacio>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3">Título</th>
              <th className="p-3">Autor</th>
              <th className="p-3">Año</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Enlace</th>
              {puedeGestionar && <th className="p-3">Acciones</th>}
            </tr>
          </thead>

          <tbody>
            {recursos.map((recurso) => (
              <tr
                key={recurso.id}
                className="border-t border-slate-100 hover:bg-slate-50"
              >
                <td className="p-3 font-medium text-slate-800">{recurso.titulo}</td>

                <td className="p-3 text-slate-600">{recurso.autor || "—"}</td>

                <td className="p-3 text-slate-600">{recurso.anioPublicacion || "—"}</td>

                <td className="p-3 text-slate-600">{recurso.tipoRecurso}</td>

                <td className="p-3">
                  <a
                    href={recurso.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Ver recurso
                  </a>
                </td>

                {puedeGestionar && (
                  <td className="p-3">
                    <div className="flex gap-3">
                      <button
                        onClick={() => abrirFormulario(recurso)}
                        className="font-medium text-primary hover:underline"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => eliminarRecurso(recurso.id)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Recursos bibliográficos
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {puedeGestionar
              ? "Consulta y administra los recursos del curso."
              : "Consulta los recursos de apoyo del curso."}
          </p>
        </div>

        {puedeGestionar && (
          <button
            onClick={() => abrirFormulario()}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
          >
            + Agregar recurso
          </button>
        )}
      </div>

      {mensajeError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {mensajeError}
        </div>
      )}

      {puedeGestionar && mostrarFormulario && (
        <form
          onSubmit={guardarRecurso}
          className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-800">
            {recursoEditando ? "Editar recurso" : "Nuevo recurso"}
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="titulo"
              value={formulario.titulo}
              onChange={manejarCambio}
              placeholder="Título del recurso"
              required
              className="rounded-md border border-slate-200 bg-white p-3 text-xs"
            />

            <input
              name="autor"
              value={formulario.autor}
              onChange={manejarCambio}
              placeholder="Autor"
              className="rounded-md border border-slate-200 bg-white p-3 text-xs"
            />

            <input
              name="anioPublicacion"
              type="number"
              value={formulario.anioPublicacion}
              onChange={manejarCambio}
              placeholder="Año de publicación"
              className="rounded-md border border-slate-200 bg-white p-3 text-xs"
            />

            <select
              name="tipoRecurso"
              value={formulario.tipoRecurso}
              onChange={manejarCambio}
              className="rounded-md border border-slate-200 bg-white p-3 text-xs"
            >
              <option value="LIBRO">Libro</option>
              <option value="ARTICULO">Artículo</option>
              <option value="VIDEO">Video</option>
              <option value="ENLACE">Enlace</option>
              <option value="DOCUMENTO">Documento</option>
            </select>

            <input
              name="enlace"
              type="url"
              value={formulario.enlace}
              onChange={manejarCambio}
              placeholder="Enlace del recurso"
              required
              className="rounded-md border border-slate-200 bg-white p-3 text-xs md:col-span-2"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {contenido()}
    </section>
  );
}