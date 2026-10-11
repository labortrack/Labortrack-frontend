export const FOTO_FORMATOS_PERMITIDOS = ["image/jpeg", "image/png"];
export const FOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validarFotoPerfil(file: File): string | null {
  if (!FOTO_FORMATOS_PERMITIDOS.includes(file.type)) {
    return "Formato no válido. Solo se permiten imágenes en formato JPG o PNG.";
  }
  if (file.size > FOTO_MAX_SIZE_BYTES) {
    return "La imagen supera el tamaño máximo permitido de 5 MB.";
  }
  return null;
}
