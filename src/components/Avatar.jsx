import { useState } from "react";
import { urlFoto } from "../utils/urls";

function iniciales(usuario) {
  const nombre = (usuario?.nombre || "").trim().split(" ").filter(Boolean);
  const apellido = (usuario?.apellido || "").trim().split(" ").filter(Boolean);

  if (nombre.length && apellido.length) return (nombre[0][0] + apellido[0][0]).toUpperCase();
  return nombre
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "?";
}

export default function Avatar({ usuario, tamano = 40, className = "" }) {
  const src = urlFoto(usuario?.fotoPerfilUrl, usuario?.fotoVersion);
  const [falloSrc, setFalloSrc] = useState(null);
  const mostrarFoto = src && falloSrc !== src;

  const estilo = { width: tamano, height: tamano, fontSize: Math.max(10, Math.round(tamano * 0.36)) };

  if (mostrarFoto) {
    return (
      <img
        src={src}
        alt={usuario?.nombre ? `Foto de ${usuario.nombre}` : "Foto de perfil"}
        style={estilo}
        onError={() => setFalloSrc(src)}
        className={`shrink-0 rounded-full object-cover bg-slate-200 ${className}`}
      />
    );
  }

  return (
    <span
      style={estilo}
      className={`grid shrink-0 place-items-center rounded-full bg-slate-700 font-semibold text-white ${className}`}
    >
      {iniciales(usuario)}
    </span>
  );
}