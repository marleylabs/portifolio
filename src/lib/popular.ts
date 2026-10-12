/**
 * Artigos "mais lidos" enquanto o contador de visualizações não existe (ou não tem
 * dados suficientes). Formato: "categoria/slug". Um id que não corresponda a nenhum
 * artigo quebra o build — assim um slug renomeado não some da lista em silêncio.
 */
export const POPULAR_FALLBACK: string[] = ["css/molas-em-css"];
