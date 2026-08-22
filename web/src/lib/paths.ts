/** Construye la URL de un archivo estático bajo public/data, respetando el base path de despliegue. */
export function dataUrl(path: string): string {
  return `${import.meta.env.BASE_URL}data/${path}`
}
