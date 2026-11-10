import { useState } from "react";
import { urlFoto } from "../utils/urls";

function iniciales(usuario) {
  const texto = `${usuario?.nombre?.[0] ?? ""}${usuario?.apellido?.[0] ?? ""}`.toUpperCase();
  return texto || "?";
}

function AvatarInterno({ src, usuario, tamano }) {
  const [fallo, setFallo] = useState(false);
  const estilo = { width: tamano, height: tamano };

  if (!src || fallo) {
    return (
      <div
        style={{ ...estilo, fontSize: tamano / 2.5 }}
        className="rounded-full bg-gray-300 text-gray-700 flex items-center justify-center font-semibold shrink-0"
      >
        {iniciales(usuario)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Foto de perfil"
      style={estilo}
      className="rounded-full object-cover shrink-0"
      onError={() => setFallo(true)}
    />
  );
}

export default function Avatar({ usuario, tamano = 64 }) {
  const src = urlFoto(usuario?.fotoPerfilUrl, usuario?.fotoVersion);
  return <AvatarInterno key={src ?? "sin-foto"} src={src} usuario={usuario} tamano={tamano} />;
}