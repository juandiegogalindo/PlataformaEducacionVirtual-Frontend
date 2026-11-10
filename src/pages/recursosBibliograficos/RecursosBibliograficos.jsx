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

export default function RecursosBibliograficos() {
  const { cursoId } = useParams();

  const [recursos, setRecursos] = useState([]);
  const [formulario, setFormulario] = useState(formularioInicial);
  const [recursoEditando, setRecursoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarRecursos() {
    try {
      setCargando(true);
      setError("");
      const respuesta = await listarRecursosRequest(cursoId);
      setRecursos(respuesta.data);
    } catch (err) {
      setError("No fue posible cargar los recursos bibliográficos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (cursoId) cargarRecursos();
  }, [cursoId]);

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
      const datos = {
        ...formulario,
        anioPublicacion: formulario.anioPublicacion
          ? Number(formulario.anioPublicacion)
          : null,
      };

      if (recursoEditando) {
        await actualizarRecursoRequest(
          cursoId,
          recursoEditando.id,
          datos
        );
      } else {
        await crearRecursoRequest(cursoId, datos);
      }

      setMostrarFormulario(false);
      setFormulario(formularioInicial);
      setRecursoEditando(null);
      await cargarRecursos();
    } catch (err) {
      setError("No fue posible guardar el recurso. Verifica los datos.");
    }
  }

  async function eliminarRecurso(recursoId) {
    if (!window.confirm("¿Deseas eliminar este recurso?")) return;

    try {
      await eliminarRecursoRequest(cursoId, recursoId);
      await cargarRecursos();
    } catch (err) {
      setError("No fue posible eliminar el recurso.");
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Recursos Bibliográficos
          </h1>
          <p className="mt-1 text-gray-500">
            Consulta y administra los recursos del curso.
          </p>
        </div>

        <button
          onClick={() => abrirFormulario()}
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
        >
          + Agregar recurso
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {mostrarFormulario && (
        <form
          onSubmit={guardarRecurso}
          className="mb-6 rounded-xl border bg-white p-5 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">
            {recursoEditando ? "Editar recurso" : "Nuevo recurso"}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="titulo"
              value={formulario.titulo}
              onChange={manejarCambio}
              placeholder="Título del recurso"
              required
              className="rounded-lg border p-3"
            />

            <input
              name="autor"
              value={formulario.autor}
              onChange={manejarCambio}
              placeholder="Autor"
              className="rounded-lg border p-3"
            />

            <input
              name="anioPublicacion"
              type="number"
              value={formulario.anioPublicacion}
              onChange={manejarCambio}
              placeholder="Año de publicación"
              className="rounded-lg border p-3"
            />

            <select
              name="tipoRecurso"
              value={formulario.tipoRecurso}
              onChange={manejarCambio}
              className="rounded-lg border p-3"
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
              className="rounded-lg border p-3 md:col-span-2"
            />
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Guardar
            </button>

            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="rounded-lg border px-5 py-2 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-center text-gray-500">
            Cargando recursos...
          </p>
        ) : recursos.length === 0 ? (
          <p className="p-6 text-center text-gray-500">
            No hay recursos bibliográficos registrados para este curso.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4">Título</th>
                <th className="p-4">Autor</th>
                <th className="p-4">Año</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Enlace</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {recursos.map((recurso) => (
                <tr key={recurso.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">{recurso.titulo}</td>
                  <td className="p-4">{recurso.autor || "—"}</td>
                  <td className="p-4">{recurso.anioPublicacion || "—"}</td>
                  <td className="p-4">{recurso.tipoRecurso}</td>
                  <td className="p-4">
                    <a
                      href={recurso.enlace}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ver recurso
                    </a>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => abrirFormulario(recurso)}
                        className="font-medium text-blue-600 hover:underline"
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
    </div>
  );
}