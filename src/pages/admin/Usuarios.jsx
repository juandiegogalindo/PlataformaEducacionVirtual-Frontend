import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cambiarEstadoUsuarioRequest, listarUsuariosRequest } from "../../api/admin";
import { useAuthStore } from "../../auth/authStore";
import { nombreRol } from "./adminUtils";
import { mensajeError } from "../../utils/errores";
import Avatar from "../../components/Avatar";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";

function ConfirmarEstado({ usuario, onClose, onConfirm, guardando, error }) {
  const dialog = useRef(null);

  useEffect(() => {
    const elemento = dialog.current;
    elemento.showModal();
    return () => elemento.close();
  }, []);

  return (
    <dialog ref={dialog} className="admin-dialog" aria-labelledby="confirmar-titulo"
      onCancel={(event) => { event.preventDefault(); if (!guardando) onClose(); }}>
      <h2 id="confirmar-titulo">{usuario.activo ? "Desactivar" : "Activar"} cuenta</h2>
      <p>¿Quieres {usuario.activo ? "desactivar" : "activar"} la cuenta de <strong>{usuario.nombre} {usuario.apellido}</strong>?</p>
      <p className="admin-muted">{usuario.activo
        ? "La persona no podrá iniciar sesión. Sus datos se conservarán."
        : "La persona podrá volver a iniciar sesión en la plataforma."}</p>
      {error && <Alert variant="error" title={error} className="mb-5" />}
      <div className="admin-actions">
        <button className="admin-button admin-button-secondary" onClick={onClose} disabled={guardando}>Cancelar</button>
        <button className={`admin-button ${usuario.activo ? "admin-button-danger" : "admin-button-primary"}`}
          onClick={onConfirm} disabled={guardando}>
          {guardando ? "Guardando…" : usuario.activo ? "Desactivar cuenta" : "Activar cuenta"}
        </button>
      </div>
    </dialog>
  );
}

export default function Usuarios() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [rol, setRol] = useState("");
  const [estado, setEstado] = useState("");
  const [aviso, setAviso] = useState(location.state?.mensaje || "");
  const [seleccionado, setSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const enviando = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    listarUsuariosRequest(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setUsuarios(data);
        setError("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(mensajeError(err, "No se pudieron cargar los usuarios."));
      })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [recarga]);

  function recargar() {
    setCargando(true);
    setError("");
    setRecarga((valor) => valor + 1);
  }

  async function confirmarCambio() {
    if (enviando.current) return;
    enviando.current = true;
    setGuardando(true);
    setErrorAccion("");
    try {
      const { data } = await cambiarEstadoUsuarioRequest(seleccionado.id, !seleccionado.activo);
      setUsuarios((actuales) => actuales.map((usuario) => usuario.id === data.id ? data : usuario));
      setAviso(`La cuenta de ${data.nombre} ${data.apellido} fue ${data.activo ? "activada" : "desactivada"}.`);
      setSeleccionado(null);
    } catch (err) {
      setErrorAccion(mensajeError(err, "No se pudo cambiar el estado de la cuenta."));
    } finally {
      enviando.current = false;
      setGuardando(false);
    }
  }

  const consulta = busqueda.trim().toLocaleLowerCase("es");
  const visibles = usuarios.filter((usuario) => (
    (!rol || nombreRol(usuario.rol) === rol)
    && (!estado || usuario.activo === (estado === "activo"))
    && `${usuario.nombre} ${usuario.apellido} ${usuario.correo}`.toLocaleLowerCase("es").includes(consulta)
  )).sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, "es"));

  return (
    <>
      <div className="admin-page-heading">
        <div><p className="admin-eyebrow">ADMINISTRACIÓN</p><h1>Gestionar usuarios</h1>
          <p className="admin-muted">Registro y cambio de estado de las cuentas de la plataforma.</p></div>
        <Link to="/admin/usuarios/nuevo" className="admin-button admin-button-primary"><span aria-hidden="true">＋</span> Registrar usuario</Link>
      </div>

      {aviso && <div className="admin-notice">
        <Alert variant="success" title={aviso} className="flex-1" />
        <button aria-label="Cerrar mensaje" onClick={() => setAviso("")}>×</button>
      </div>}

      <section className="admin-card" aria-label="Listado de usuarios">
        <div className="admin-filters">
          <label className="admin-field admin-search">Buscar usuario
            <input type="search" placeholder="Nombre o correo electrónico" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
          </label>
          <div className="admin-field"><label htmlFor="filtro-rol">Rol</label>
            <select id="filtro-rol" value={rol} onChange={(event) => setRol(event.target.value)}>
              <option value="">Todos los roles</option><option>Estudiante</option><option>Docente</option>
              <option>Coordinador académico</option><option>Administrador</option>
            </select>
          </div>
          <div className="admin-field"><label htmlFor="filtro-estado">Estado</label>
            <select id="filtro-estado" value={estado} onChange={(event) => setEstado(event.target.value)}>
              <option value="">Todos los estados</option><option value="activo">Activo</option><option value="inactivo">Inactivo</option>
            </select>
          </div>
          <button className="admin-button admin-button-secondary" onClick={recargar} disabled={cargando || guardando}>Actualizar</button>
        </div>

        {cargando ? <div className="admin-empty" role="status">Cargando usuarios…</div> : error ? (
          <div className="admin-empty"><Alert variant="error" title={error} />
            <button className="admin-button admin-button-secondary" onClick={recargar}>Reintentar</button></div>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <caption className="admin-sr-only">Usuarios de la plataforma y acciones sobre sus cuentas</caption>
                <thead><tr><th scope="col">Usuario</th><th scope="col">Rol</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
                <tbody>{visibles.map((usuario) => {
                  const esPropio = usuario.id === user?.id || usuario.correo === user?.correo;
                  return (
                    <tr key={usuario.id}>
                      <td><div className="admin-user-cell">
                        <Avatar usuario={usuario} tamano={32} />
                        <div><strong>{usuario.nombre} {usuario.apellido}{esPropio && <span className="admin-self"> (Tú)</span>}</strong><span className="admin-user-email">{usuario.correo}</span></div>
                      </div></td>
                      <td><Badge variant="info">{nombreRol(usuario.rol)}</Badge></td>
                      <td><Badge variant={usuario.activo ? "success" : "neutral"}>{usuario.activo ? "Activo" : "Inactivo"}</Badge></td>
                      <td><button className="admin-button admin-button-secondary admin-button-small"
                        disabled={guardando || (esPropio && usuario.activo)}
                        title={esPropio && usuario.activo ? "No puedes desactivar tu propia cuenta desde esta pantalla." : undefined}
                        aria-label={`${usuario.activo ? "Desactivar" : "Activar"} a ${usuario.nombre} ${usuario.apellido}`}
                        onClick={() => { setErrorAccion(""); setSeleccionado(usuario); }}>
                        {usuario.activo ? "Desactivar" : "Activar"}
                      </button></td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
            {visibles.length === 0 && <div className="admin-empty">
              <h2>{usuarios.length ? "No hay coincidencias" : "Todavía no hay usuarios"}</h2>
              <p className="admin-muted">{usuarios.length ? "Prueba con otro nombre, correo o filtro." : "Registra una cuenta para comenzar."}</p>
              {(busqueda || rol || estado) && <button className="admin-button admin-button-secondary" onClick={() => { setBusqueda(""); setRol(""); setEstado(""); }}>Limpiar filtros</button>}
            </div>}
            <p className="admin-table-footer" role="status">{visibles.length} de {usuarios.length} usuarios</p>
          </>
        )}
      </section>
      {seleccionado && <ConfirmarEstado usuario={seleccionado} onClose={() => setSeleccionado(null)}
        onConfirm={confirmarCambio} guardando={guardando} error={errorAccion} />}
    </>
  );
}
