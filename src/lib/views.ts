import "server-only";

/**
 * Contador de visualizações — interface pronta, implementação depois.
 *
 * Deve devolver um mapa "categoria/slug" → total de visualizações, ou `null` quando
 * não houver dados (serviço fora do ar, ainda sem contagens, ambiente de build…).
 * Quem consome (getPopular) trata `null` como "use a lista manual".
 */
export async function getViewCounts(): Promise<Map<string, number> | null> {
  return null;
}
