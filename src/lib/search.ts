export type SearchItem = {
  href: string;
  /** Conteúdo publicado fora (externalUrl): abre em nova aba. */
  external: boolean;
  type: "Artigo" | "Projeto";
  title: string;
  description: string;
  keywords: string;
};

/** Trechos do título que casaram com a busca, como pares [início, fim] (inclusivos). */
export type SearchResult = SearchItem & { titleMatches: readonly [number, number][] };

export type Searcher = (query: string) => SearchResult[];
