/*
 * Categorias de conteúdo. Lista fechada: o frontmatter só aceita estas chaves (zod) e,
 * para artigos, a chave vira o primeiro segmento da URL — /css/meu-artigo.
 * Este arquivo não depende de nada do servidor; componentes de cliente podem importá-lo.
 */

export const ARTICLE_CATEGORIES = {
  css: {
    label: "CSS",
    description: "Layout, animação e os detalhes que fazem uma interface parecer viva.",
  },
  react: {
    label: "React",
    description: "Componentes, estado e padrões para interfaces que escalam.",
  },
  javascript: {
    label: "JavaScript",
    description: "A linguagem, o navegador e as APIs da plataforma web.",
  },
  backend: {
    label: "Back-end",
    description: "APIs, bancos de dados e infraestrutura por trás das telas.",
  },
  carreira: {
    label: "Carreira",
    description: "Aprendizados de quem vive de construir software.",
  },
} as const satisfies Record<string, { label: string; description: string }>;

export const PROJECT_CATEGORIES = {
  produto: { label: "Produto" },
  "open-source": { label: "Open source" },
  experimento: { label: "Experimento" },
} as const satisfies Record<string, { label: string }>;

/*
 * Áreas do trabalho (os planetas do hero). Um projeto pode ter mais de uma; /projetos
 * filtra por ?area=. `noun` completa a frase do estado vazio: "projetos de {noun}".
 */
export const PROJECT_AREAS = {
  frontend: { label: "Frontend", noun: "frontend" },
  backend: { label: "Backend", noun: "backend" },
  dados: { label: "Banco de dados", noun: "banco de dados" },
  ia: { label: "IA e vibe coding", noun: "IA" },
  devops: { label: "DevOps e cloud", noun: "DevOps e cloud" },
} as const satisfies Record<string, { label: string; noun: string }>;

export type ProjectArea = keyof typeof PROJECT_AREAS;
export const PROJECT_AREA_KEYS = Object.keys(PROJECT_AREAS) as [ProjectArea, ...ProjectArea[]];
export const isProjectArea = (value: string | null): value is ProjectArea => value !== null && value in PROJECT_AREAS;

export type ArticleCategory = keyof typeof ARTICLE_CATEGORIES;
export type ProjectCategory = keyof typeof PROJECT_CATEGORIES;

export const ARTICLE_CATEGORY_KEYS = Object.keys(ARTICLE_CATEGORIES) as [ArticleCategory, ...ArticleCategory[]];
export const PROJECT_CATEGORY_KEYS = Object.keys(PROJECT_CATEGORIES) as [ProjectCategory, ...ProjectCategory[]];

/**
 * Primeiros segmentos de URL já usados por rotas fixas. Uma categoria com um destes
 * nomes "sumiria" (a rota fixa vence), então o build falha antes disso acontecer.
 */
export const RESERVED_SEGMENTS = [
  "artigos",
  "projetos",
  "sobre",
  "contato",
  "rss.xml",
  "sitemap.xml",
  "robots.txt",
  "search-index.json",
  "_next",
  "api",
] as const;

export function isArticleCategory(value: string): value is ArticleCategory {
  return Object.hasOwn(ARTICLE_CATEGORIES, value);
}

/** /css, /css/algum-artigo → true. Usado para destacar "Artigos" na navegação. */
export function isArticlePath(pathname: string) {
  const [first] = pathname.split("/").filter(Boolean);
  return first !== undefined && isArticleCategory(first);
}
