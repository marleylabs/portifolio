import "server-only";

import { stat } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";
import { ARTICLE_CATEGORIES, PROJECT_CATEGORIES } from "./categories";
import { getAllArticles, getAllProjects, type ArticleSummary, type ProjectSummary } from "./content";
import { site } from "./site";

/*
 * Feed RSS 2.0 (artigos + projetos).
 *
 * - content:encoded leva só o resumo + "Continuar lendo": os artigos têm demos
 *   interativas que não funcionam dentro de leitores de RSS.
 * - guid = URL do item, com isPermaLink="false": é um identificador estável, e não
 *   promete que a URL seja permanente (um slug pode mudar).
 * - lastBuildDate = data do conteúdo mais recente (não a hora do build): o feed só
 *   "muda" quando há conteúdo novo.
 */

const MIME_BY_EXTENSION: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".gif": "image/gif",
};

type FeedEntry = (ArticleSummary | ProjectSummary) & { url: string; categories: string[] };

/** CDATA não aceita "]]>" dentro; partimos a sequência em dois blocos CDATA. */
const cdata = (value: string) => `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;

const escapeXml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** RFC 822 (o que o RSS 2.0 exige). Meio-dia UTC: a data não "vira" em nenhum fuso. */
const rfc822 = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`).toUTCString();

const absolute = (href: string) => (href.startsWith("http") ? href : `${site.url}${href}`);

async function enclosure(entry: FeedEntry) {
  if (!entry.cover) return "";
  const type = MIME_BY_EXTENSION[path.extname(entry.cover.src).toLowerCase()];
  if (!type) return "";
  // O RSS 2.0 exige o tamanho em bytes no enclosure.
  const { size } = await stat(path.join(process.cwd(), "public", entry.cover.src));
  return `\n      <enclosure url="${escapeXml(absolute(entry.cover.src))}" length="${size}" type="${type}" />`;
}

function encodedContent(entry: FeedEntry) {
  const label = entry.isExternal ? `Ler em ${entry.externalHost} →` : "Continuar lendo →";
  return `<p>${escapeXml(entry.summary)}</p><p><a href="${escapeXml(entry.url)}">${escapeXml(label)}</a></p>`;
}

/** Sem repetir "CSS" (categoria) e "css" (tag). */
function uniqueCategories(names: string[]) {
  const seen = new Set<string>();
  return names.filter((name) => {
    const key = name.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function renderItem(entry: FeedEntry) {
  const categories = uniqueCategories(entry.categories).map((name) => `\n      <category>${cdata(name)}</category>`).join("");
  return `    <item>
      <title>${cdata(entry.title)}</title>
      <description>${cdata(entry.summary)}</description>
      <link>${escapeXml(entry.url)}</link>
      <guid isPermaLink="false">${escapeXml(entry.url)}</guid>
      <dc:creator>${cdata(site.name)}</dc:creator>
      <pubDate>${rfc822(entry.publishedOn)}</pubDate>${categories}${await enclosure(entry)}
      <content:encoded>${cdata(encodedContent(entry))}</content:encoded>
    </item>`;
}

export async function buildFeed() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });

  const [articles, projects] = await Promise.all([getAllArticles(), getAllProjects()]);
  const entries: FeedEntry[] = [
    ...articles.map((article) => ({
      ...article,
      url: absolute(article.href),
      categories: [ARTICLE_CATEGORIES[article.category].label, ...article.tags],
    })),
    ...projects.map((project) => ({
      ...project,
      url: absolute(project.href),
      categories: ["Projeto", PROJECT_CATEGORIES[project.category].label, ...project.tags],
    })),
  ].sort((a, b) => b.publishedOn.localeCompare(a.publishedOn));

  const latest = entries
    .map((entry) => entry.updatedOn ?? entry.publishedOn)
    .sort()
    .at(-1);
  const items = await Promise.all(entries.map(renderItem));

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${cdata(site.name)}</title>
    <description>${cdata(site.description)}</description>
    <link>${escapeXml(site.url)}</link>
    <language>pt-BR</language>${latest ? `\n    <lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ""}
    <atom:link href="${escapeXml(`${site.url}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items.join("\n")}
  </channel>
</rss>
`;
}
