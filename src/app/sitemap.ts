import type { MetadataRoute } from "next";
import { getAllArticles, getAllProjects, getArticleCategories } from "@/lib/content";
import { site } from "@/lib/site";

/** Só páginas deste site: entradas com externalUrl vivem em outro domínio. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects, categories] = await Promise.all([
    getAllArticles(),
    getAllProjects(),
    getArticleCategories(),
  ]);

  const staticRoutes = ["", "/projetos", "/artigos", "/sobre", "/contato"].map((route) => ({
    url: `${site.url}${route}`,
  }));

  const categoryRoutes = categories.map(({ key }) => ({ url: `${site.url}/${key}` }));

  const entries = [...articles, ...projects]
    .filter(({ isExternal }) => !isExternal)
    .map(({ href, publishedOn, updatedOn }) => ({
      url: `${site.url}${href}`,
      lastModified: updatedOn ?? publishedOn,
    }));

  return [...staticRoutes, ...categoryRoutes, ...entries];
}
