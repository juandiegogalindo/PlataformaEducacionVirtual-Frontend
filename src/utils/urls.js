const BASE_API = import.meta.env.VITE_API_URL;

// fotoPerfilUrl llega relativa (/api/usuarios/7/foto), así que se le antepone la URL base.
// Si ya es absoluta (un link pegado antes a mano), se deja como está.
// version: un valor que cambie tras subir una foto nueva (por ejemplo Date.now()),
// para que el navegador no muestre la foto vieja guardada en caché.
export function urlFoto(fotoPerfilUrl, version) {
  if (!fotoPerfilUrl) return null;
  const base = fotoPerfilUrl.startsWith("http") ? fotoPerfilUrl : `${BASE_API}${fotoPerfilUrl}`;
  return version ? `${base}?t=${version}` : base;
}