import "server-only";

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { cacheLife } from "next/cache";
import readingTime from "reading-time";
import { z } from "zod";
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_KEYS,
  PROJECT_CATEGORY_KEYS,
  RESERVED_SEGMENTS,
  isArticleCategory,
  type ArticleCategory,
} from "./categories";
import { POPULAR_FALLBACK } from "./popular";
import { getViewCounts } from "./views";

/*
 * Modelo de conteúdo.
 *
 *   content/articles/*.mdx  → /[category]/[slug]   (ou link externo, se externalUrl)
 *   content/projects/*.mdx  → /projetos/[slug]     (idem)
 *
 * O frontmatter é validado com zod no build: um campo faltando, com tipo errado ou
 * com nome digitado errado (os schemas são .strict()) quebra o build com uma mensagem
 * apontando o arquivo e o campo. O nome do arquivo não importa — vale o `slug`.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");

// Mensagens de validação padrão do zod em português.
z.config(z.locales.ptBR());

/*
 * YAML com o schema JSON: sem conversões automáticas. O padrão do YAML transforma
 * `2026-13-45` num Date e o JavaScript "corrige" para 14/02/2027 — o erro sumiria.
 * Lendo como texto, quem valida a data (inclusive o calendário) é o zod.
 */
const matterOptions = {
  engines: { yaml: (source: string) => yaml.load(source, { schema: yaml.JSON_SCHEMA }) as object },
};

// ---------- Schemas ----------

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const dateField = z.iso.date({ error: "use uma data real no formato AAAA-MM-DD" });

/** Conta frases pela pontuação final seguida de espaço/fim ("Next.js" não conta). */
function countSentences(text: string) {
  return (text.trim().match(/[.!?…]+(?=\s|$)/g) ?? []).length;
}

const summaryField = z
  .string()
  .trim()
  .refine((text) => {
    const sentences = countSentences(text);
    return sentences >= 2 && sentences <= 4;
  }, "o resumo deve ter de 2 a 4 frases (terminadas em . ! ? ou …)");

const coverField = z
  .object({
    src: z
      .string()
      .startsWith("/", "use um caminho dentro de /public, começando com /")
      .refine((src) => existsSync(path.join(process.cwd(), "public", src)), "arquivo não encontrado em /public"),
    alt: z.string().trim().min(1, "descreva a imagem para quem usa leitor de tela"),
  })
  .strict();

const commonFields = {
  title: z.string().trim().min(1),
  slug: z.string().regex(SLUG_PATTERN, "use só minúsculas, números e hífens (ex.: meu-artigo)"),
  summary: summaryField,
  publishedOn: dateField,
  updatedOn: dateField.optional(),
  tags: z.array(z.string().trim().min(1)),
  cover: coverField.optional(),
  externalUrl: z.httpUrl({ error: "use a URL completa, começando com https://" }).optional(),
  /** Extra: rascunhos aparecem em `npm run dev` e somem do build de produção. */
  draft: z.boolean().default(false),
};

const updatedAfterPublished = {
  check: (data: { publishedOn: string; updatedOn?: string }) =>
    !data.updatedOn || data.updatedOn >= data.publishedOn,
  params: { error: "updatedOn não pode ser anterior a publishedOn", path: ["updatedOn"] },
};

const articleSchema = z
  .object({
    ...commonFields,
    category: z.enum(ARTICLE_CATEGORY_KEYS),
  })
  .strict()
  .refine(updatedAfterPublished.check, updatedAfterPublished.params);

const projectSchema = z
  .object({
    ...commonFields,
    category: z.enum(PROJECT_CATEGORY_KEYS),
    /** Projetos sempre têm capa: é ela que sustenta os cards. */
    cover: coverField,
    stack: z.array(z.string().trim().min(1)).min(1, "liste ao menos uma tecnologia"),
    featured: z.boolean().default(false),
    /** Opcional: seu papel no projeto ("Fullstack", "Front-end e design"…). */
    role: z.string().trim().min(1).optional(),
    links: z
      .object({
        demo: z.httpUrl({ error: "use a URL completa, começando com https://" }).optional(),
        github: z.httpUrl({ error: "use a URL completa, começando com https://" }).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(updatedAfterPublished.check, updatedAfterPublished.params);

// ---------- Tipos ----------

type Derived = {
  /** Destino do card: página interna ou o link externo. */
  href: string;
  isExternal: boolean;
  /** "dev.to", "medium.com"… — só para entradas externas. */
  externalHost: string | null;
  /** null para entradas externas (o texto não está aqui para medirmos). */
  readingMinutes: number | null;
  body: string;
};

export type Article = z.output<typeof articleSchema> & Derived & { type: "article"; id: string };
export type Project = z.output<typeof projectSchema> & Derived & { type: "project"; id: string };
export type ArticleSummary = Omit<Article, "body">;
export type ProjectSummary = Omit<Project, "body">;

// ---------- Leitura e validação ----------

async function readCollection<Schema extends z.ZodType>(directory: string, schema: Schema) {
  const absolute = path.join(CONTENT_DIR, directory);
  const files = (await readdir(absolute)).filter((file) => file.endsWith(".mdx"));

  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(absolute, file), "utf8");
      const { data, content } = matter(raw, matterOptions);
      const result = schema.safeParse(data);
      if (!result.success) {
        throw new Error(`Frontmatter inválido em content/${directory}/${file}:\n${z.prettifyError(result.error)}`);
      }
      return { file: `content/${directory}/${file}`, data: result.data as z.output<Schema>, body: content };
    }),
  );
}

function derive(externalUrl: string | undefined, internalHref: string, body: string) {
  const isExternal = externalUrl !== undefined;
  return {
    href: externalUrl ?? internalHref,
    isExternal,
    externalHost: externalUrl ? new URL(externalUrl).hostname.replace(/^www\./, "") : null,
    readingMinutes: isExternal ? null : Math.max(1, Math.round(readingTime(body).minutes)),
    body: isExternal ? "" : body,
  };
}

function assertUnique(entries: { id: string; file: string }[], kind: string) {
  const seen = new Map<string, string>();
  for (const { id, file } of entries) {
    const previous = seen.get(id);
    if (previous) throw new Error(`${kind} duplicado "${id}": ${previous} e ${file}`);
    seen.set(id, file);
  }
}

/** Rascunhos: visíveis em dev, ou num build com SHOW_DRAFTS=true (ex.: previews da Vercel). */
const isPublished = (entry: { draft: boolean }) =>
  process.env.NODE_ENV !== "production" || process.env.SHOW_DRAFTS === "true" || !entry.draft;

/** Mais recente primeiro; empate (mesmo dia) desempata pelo título, para a ordem ser estável. */
function byDateDesc(a: { publishedOn: string; title: string }, b: { publishedOn: string; title: string }) {
  return b.publishedOn.localeCompare(a.publishedOn) || a.title.localeCompare(b.title, "pt-BR");
}

function withoutBody<T extends { body: string }>(entry: T): Omit<T, "body"> {
  const summary: Partial<T> = { ...entry };
  delete summary.body;
  return summary as Omit<T, "body">;
}

async function loadArticles(): Promise<Article[]> {
  "use cache";
  cacheLife("max"); // conteúdo só muda a cada deploy

  const collisions = ARTICLE_CATEGORY_KEYS.filter((key) => (RESERVED_SEGMENTS as readonly string[]).includes(key));
  if (collisions.length > 0) {
    throw new Error(`Categorias colidem com rotas fixas: ${collisions.join(", ")} (ver lib/categories.ts)`);
  }

  const entries = (await readCollection("articles", articleSchema)).map(({ file, data, body }) => ({
    file,
    article: {
      ...data,
      ...derive(data.externalUrl, `/${data.category}/${data.slug}`, body),
      type: "article" as const,
      id: `${data.category}/${data.slug}`,
    },
  }));
  assertUnique(entries.map(({ file, article }) => ({ id: article.id, file })), "Artigo");

  return entries.map(({ article }) => article).filter(isPublished).sort(byDateDesc);
}

/** Seções obrigatórias de um estudo de caso, nesta ordem (títulos ## no MDX). */
export const CASE_STUDY_SECTIONS = ["Problema", "Solução", "Arquitetura", "Desafios", "Resultado"] as const;

const normalizeHeading = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();

/**
 * Garante o formato Problema → Solução → Arquitetura → Desafios → Resultado.
 * Outros ## entre elas são permitidos (e a seção opcional <BuiltWithAI> é um
 * componente, não um ##). Projetos externos não têm corpo e ficam de fora.
 */
function assertCaseStudyStructure(file: string, body: string) {
  const withoutCode = body.replace(/^(```|~~~)[\s\S]*?^\1/gm, "");
  const headings = [...withoutCode.matchAll(/^##[ \t]+(.+?)[ \t#]*$/gm)].map(([, text]) => normalizeHeading(text));

  let cursor = 0;
  for (const section of CASE_STUDY_SECTIONS) {
    const index = headings.indexOf(normalizeHeading(section), cursor);
    if (index === -1) {
      throw new Error(
        `${file}: estudo de caso sem a seção "## ${section}" (ou fora de ordem). ` +
          `Ordem esperada: ${CASE_STUDY_SECTIONS.join(" → ")}.`,
      );
    }
    cursor = index + 1;
  }
}

async function loadProjects(): Promise<Project[]> {
  "use cache";
  cacheLife("max");

  const entries = (await readCollection("projects", projectSchema)).map(({ file, data, body }) => ({
    file,
    project: {
      ...data,
      ...derive(data.externalUrl, `/projetos/${data.slug}`, body),
      type: "project" as const,
      id: data.slug,
    },
  }));
  assertUnique(entries.map(({ file, project }) => ({ id: project.id, file })), "Projeto");
  for (const { file, project } of entries) {
    if (!project.isExternal) assertCaseStudyStructure(file, project.body);
  }

  return entries.map(({ project }) => project).filter(isPublished).sort(byDateDesc);
}

// ---------- API pública ----------

/** Todos os artigos (internos e externos), do mais recente ao mais antigo. */
export async function getAllArticles(): Promise<ArticleSummary[]> {
  return (await loadArticles()).map(withoutBody);
}

export async function getArticlesByCategory(category: ArticleCategory): Promise<ArticleSummary[]> {
  return (await getAllArticles()).filter((article) => article.category === category);
}

/** Artigo com página interna. Externos e inexistentes devolvem null (→ 404). */
export async function getArticle(category: string, slug: string): Promise<Article | null> {
  if (!isArticleCategory(category)) return null;
  const article = (await loadArticles()).find((entry) => entry.category === category && entry.slug === slug);
  return article && !article.isExternal ? article : null;
}

/** Categorias que têm ao menos um artigo, na ordem definida em lib/categories. */
export async function getArticleCategories() {
  const articles = await getAllArticles();
  return Object.entries(ARTICLE_CATEGORIES)
    .map(([key, meta]) => ({
      key: key as ArticleCategory,
      ...meta,
      count: articles.filter((article) => article.category === key).length,
    }))
    .filter(({ count }) => count > 0);
}

export async function getAllProjects(): Promise<ProjectSummary[]> {
  return (await loadProjects()).map(withoutBody);
}

/** Projetos marcados com featured: true (a home mostra os 3 mais recentes). */
export async function getFeaturedProjects({ limit = 3 }: { limit?: number } = {}): Promise<ProjectSummary[]> {
  return (await getAllProjects()).filter((project) => project.featured).slice(0, limit);
}

/** Tecnologias usadas nos projetos, da mais frequente para a menos (empate: alfabética). */
export async function getProjectTechnologies() {
  const counts = new Map<string, number>();
  for (const project of await getAllProjects()) {
    for (const tech of project.stack) counts.set(tech, (counts.get(tech) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "pt-BR"));
}

/** Projeto com página interna. Externos e inexistentes devolvem null (→ 404). */
export async function getProject(slug: string): Promise<Project | null> {
  const project = (await loadProjects()).find((entry) => entry.slug === slug);
  return project && !project.isExternal ? project : null;
}

/**
 * Artigos mais lidos.
 * A popularidade decide QUAIS entram: pelas visualizações quando houver dados
 * (só artigos internos são contados), senão pela lista manual de lib/popular.ts.
 * A ordem de exibição, como no resto do site, é por data (mais recente primeiro).
 */
export async function getPopular({ limit = 3 }: { limit?: number } = {}): Promise<ArticleSummary[]> {
  const articles = await getAllArticles();
  const views = await getViewCounts();

  let picked: ArticleSummary[] = [];
  if (views && views.size > 0) {
    picked = articles
      .filter((article) => (views.get(article.id) ?? 0) > 0)
      .sort((a, b) => (views.get(b.id) ?? 0) - (views.get(a.id) ?? 0))
      .slice(0, limit);
  }

  if (picked.length === 0) {
    const byId = new Map(articles.map((article) => [article.id, article]));
    picked = POPULAR_FALLBACK.slice(0, limit).map((id) => {
      const article = byId.get(id);
      if (!article) throw new Error(`lib/popular.ts: "${id}" não corresponde a nenhum artigo publicado`);
      return article;
    });
  }

  return [...picked].sort(byDateDesc);
}

// ---------- Página "Sobre" ----------

/*
 * content/pages/sobre.mdx: o corpo é o texto pessoal; o frontmatter guarda foto,
 * linha do tempo e stack. Na stack, itens com `example: true` aparecem com um selo
 * "exemplo"; na linha do tempo, ficam fora da página (a seção some se só houver exemplos).
 */
const aboutSchema = z
  .object({
    title: z.string().trim().min(1),
    lead: z.string().trim().min(1),
    photo: coverField.optional(),
    timeline: z
      .array(
        z
          .object({
            period: z.string().trim().min(1),
            role: z.string().trim().min(1),
            organization: z.string().trim().min(1),
            description: z.string().trim().min(1),
            example: z.boolean().default(false),
          })
          .strict(),
      )
      .min(1),
    stack: z
      .array(
        z
          .object({
            group: z.string().trim().min(1),
            items: z.array(z.object({ name: z.string().trim().min(1), note: z.string().trim().min(1) }).strict()).min(1),
            example: z.boolean().default(false),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type AboutPage = z.output<typeof aboutSchema> & { body: string };

export async function getAboutPage(): Promise<AboutPage> {
  "use cache";
  cacheLife("max");
  const file = "content/pages/sobre.mdx";
  const { data, content } = matter(await readFile(path.join(process.cwd(), file), "utf8"), matterOptions);
  const result = aboutSchema.safeParse(data);
  if (!result.success) throw new Error(`Frontmatter inválido em ${file}:\n${z.prettifyError(result.error)}`);
  return { ...result.data, body: content };
}

// ---------- Formatação ----------

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Datas são só dias (sem hora), então formatamos em UTC para não "voltar" um dia. */
export function formatDate(isoDate: string) {
  return dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
}
