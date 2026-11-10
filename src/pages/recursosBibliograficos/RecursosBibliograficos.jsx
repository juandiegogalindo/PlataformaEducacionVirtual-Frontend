import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  listarRecursosRequest,
  crearRecursoRequest,
  actualizarRecursoRequest,
  eliminarRecursoRequest,
} from "../../api/recursosBibliograficos";

const formularioInicial = {
  titulo: "",
  autor: "",
  anioPublicacion: "",
  tipoRecurso: "LIBRO",
  enlace: "",
};

export default function RecursosBibliograficos({ cursoId: cursoIdProp }) {
  const params = useParams();
  const cursoId = cursoIdProp ?? params.cursoId;

  const [recursos, setRecursos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [recursoEditando, setRecursoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargadoPara, setCargadoPara] = useState(null); // curso cuyos recursos ya se cargaron
  const [recarga, setRecarga] = useState(0); // se incrementa para volver a pedir la lista
  const [error, setError] = useState("");

  // Valores derivados: no necesitan estado ni setState dentro del efecto
  const cargando = Boolean(cursoId) && cargadoPara !== cursoId;
  const errorCurso = cursoId ? "" : "No se encontró el identificador del curso.";
  const mensajeError = errorCurso || error;

  const recargar = () => setRecarga((n) => n + 1);

  useEffect(() => {
    if (!cursoId) return;

    let cancelado = false;
    listarRecursosRequest(cursoId)
      .then((respuesta) => {
        if (cancelado) return;
        setRecursos(respuesta.data);
        setError("");
      })
      .catch(() => {
        if (!cancelado) setError("No fue posible cargar los recursos bibliográficos.");
      })
      .finally(() => {
        if (!cancelado) setCargadoPara(cursoId);
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Recursos bibliográficos
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Consulta y administra los recursos del curso.
          </p>
        </div>

        <button
          onClick={() => abrirFormulario()}
          className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-dark"
        >
          + Agregar recurso
        </button>
      </div>

      {mensajeError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {mensajeError}
        </div>
      )}

      {mostrarFormulario && (
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

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        {cargando ? (
          <p className="p-6 text-center text-xs text-slate-500">
            Cargando recursos...
          </p>
        ) : recursos.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">
            No hay recursos bibliográficos registrados para este curso.
          </p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Autor</th>
                <th className="p-3">Año</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Enlace</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {recursos.map((recurso) => (
                <tr
                  key={recurso.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-3 font-medium text-slate-800">
                    {recurso.titulo}
                  </td>

                  <td className="p-3 text-slate-600">
                    {recurso.autor || "—"}
                  </td>

                  <td className="p-3 text-slate-600">
                    {recurso.anioPublicacion || "—"}
                  </td>

                  <td className="p-3 text-slate-600">
                    {recurso.tipoRecurso}
                  </td>

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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}