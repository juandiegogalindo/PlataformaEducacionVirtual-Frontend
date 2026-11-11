const BASE_API = import.meta.env.VITE_API_URL;
const ORIGEN_POR_DEFECTO = typeof window !== "undefined" ? window.location.origin : "";

const ORIGEN_API = (() => {
  try {
    return BASE_API ? new URL(BASE_API).origin : ORIGEN_POR_DEFECTO;
  } catch {
    return ORIGEN_POR_DEFECTO;
  }
})();

function urlSegura(valor) {
  if (!valor) return null;
  try {
    const url = new URL(valor, ORIGEN_API);
    const esLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    const protocoloValido = url.protocol === "https:" || (url.protocol === "http:" && esLocal);
    const origenPermitido = url.origin === ORIGEN_API || esLocal;
    return protocoloValido && origenPermitido ? url.href : null;
  } catch {
    return null;
  }
}

export function enlaceHttp(valor) {
  return urlSegura(valor);
}

// fotoPerfilUrl llega relativa (/api/usuarios/7/foto), así que se le antepone la URL base.
// Si ya es absoluta (un link pegado antes a mano), se deja como está.
// version: un valor que cambie tras subir una foto nueva (por ejemplo Date.now()),
// para que el navegador no muestre la foto vieja guardada en caché.
export function urlFoto(fotoPerfilUrl, version) {
  const base = urlSegura(fotoPerfilUrl);
  if (!base) return null;
  if (!version) return base;
  const url = new URL(base);
  url.searchParams.set("t", String(version));
  return url.href;
}