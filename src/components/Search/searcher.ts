import Fuse from "fuse.js";
import type { SearchItem, Searcher } from "@/lib/search";

const LIMIT = 8;

/**
 * Motor da busca (Fuse.js). Fica num módulo próprio para ser importado sob demanda:
 * só é baixado quando a busca abre pela primeira vez.
 *
 * - Fuzzy: tolera erros de digitação ("anmação" encontra "animação").
 * - ignoreDiacritics: "animacao" encontra "animação".
 * - ignoreLocation: o termo vale em qualquer posição do texto, não só no começo.
 * - Pesos: título > palavras-chave (categoria, tags, stack) > resumo.
 */
export function createSearcher(items: SearchItem[]): Searcher {
  const fuse = new Fuse(items, {
    keys: [
      { name: "title", weight: 0.6 },
      { name: "keywords", weight: 0.25 },
      { name: "description", weight: 0.15 },
    ],
    threshold: 0.38,
    ignoreLocation: true,
    ignoreDiacritics: true,
    includeMatches: true,
    minMatchCharLength: 2,
  });

  return (query) => {
    const trimmed = query.trim();
    if (!trimmed) return items.slice(0, LIMIT).map((item) => ({ ...item, titleMatches: [] }));

    return fuse.search(trimmed, { limit: LIMIT }).map(({ item, matches }) => ({
      ...item,
      // Trechos de 1 letra viram ruído visual: destacamos só os de 2+.
      titleMatches: (matches?.find((match) => match.key === "title")?.indices ?? []).filter(([start, end]) => end > start),
    }));
  };
}
