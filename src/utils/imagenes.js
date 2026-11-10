export function reducirImagen(archivo, ladoMax = 512) {
  return new Promise((resolve, reject) => {
    const urlTemporal = URL.createObjectURL(archivo);
    const imagen = new Image();

    imagen.onload = () => {
      URL.revokeObjectURL(urlTemporal);

      const escala = Math.min(1, ladoMax / Math.max(imagen.naturalWidth, imagen.naturalHeight));
      const ancho = Math.max(1, Math.round(imagen.naturalWidth * escala));
      const alto = Math.max(1, Math.round(imagen.naturalHeight * escala));

      const esPng = archivo.type === "image/png";
      const tipoSalida = esPng ? "image/png" : "image/jpeg";

      const canvas = document.createElement("canvas");
      canvas.width = ancho;
      canvas.height = alto;
      const contexto = canvas.getContext("2d");

      if (!esPng) {
        contexto.fillStyle = "#ffffff";
        contexto.fillRect(0, 0, ancho, alto);
      }
      contexto.drawImage(imagen, 0, 0, ancho, alto);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo procesar la imagen"));
            return;
          }
          const extension = esPng ? ".png" : ".jpg";
          resolve(new File([blob], `foto${extension}`, { type: tipoSalida }));
        },
        tipoSalida,
        0.85
      );
    };

    imagen.onerror = () => {
      URL.revokeObjectURL(urlTemporal);
      reject(new Error("No se pudo leer la imagen"));
    };

    imagen.src = urlTemporal;
  });
}