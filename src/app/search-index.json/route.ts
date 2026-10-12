import { ARTICLE_CATEGORIES, PROJECT_CATEGORIES } from "@/lib/categories";
import { getAllArticles, getAllProjects } from "@/lib/content";
import type { SearchItem } from "@/lib/search";

/**
 * Índice de busca gerado no build como arquivo estático. O cliente só o baixa quando
 * a busca é aberta, então ele não pesa no HTML nem no JS de nenhuma página.
 */
export async function GET() {
  const [articles, projects] = await Promise.all([getAllArticles(), getAllProjects()]);

  const items: SearchItem[] = [
    ...articles.map((article) => ({
      href: article.href,
      external: article.isExternal,
      type: "Artigo" as const,
      title: article.title,
      description: article.summary,
      keywords: [ARTICLE_CATEGORIES[article.category].label, ...article.tags].join(" "),
    })),
    ...projects.map((project) => ({
      href: project.href,
      external: project.isExternal,
      type: "Projeto" as const,
      title: project.title,
      description: project.summary,
      keywords: [PROJECT_CATEGORIES[project.category].label, project.role, ...project.stack, ...project.tags].join(" "),
    })),
  ];

  return Response.json(items);
}
