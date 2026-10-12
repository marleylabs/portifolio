import type { Metadata } from "next";
import Link from "next/link";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { Hero } from "@/components/Hero/Hero";
import { PopularList } from "@/components/PopularList/PopularList";
import { PostCard } from "@/components/PostCard/PostCard";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { getAllArticles, getArticleCategories, getFeaturedProjects, getPopular } from "@/lib/content";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import listing from "./listing.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({ description: site.description, path: "/" });

export default async function HomePage() {
  const [articles, featured, categories, popular] = await Promise.all([
    getAllArticles(),
    getFeaturedProjects({ limit: 3 }),
    getArticleCategories(),
    getPopular({ limit: 5 }),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: site.name,
          url: site.url,
          inLanguage: "pt-BR",
          author: { "@type": "Person", name: site.name, url: site.url, sameAs: Object.values(site.social) },
        })}
      />
      <Hero />

      <div className={styles.page}>
        {featured.length > 0 && (
          <section className={styles.section} aria-labelledby="projetos-title">
            <div className={styles.sectionHeader}>
              <h2 id="projetos-title">Projetos em destaque</h2>
              <Link href="/projetos">Todos os projetos →</Link>
            </div>
            <ul className={listing.projectGrid}>
              {featured.map((project) => (
                <li key={project.id}>
                  <ProjectCard entry={project} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {articles.length > 0 && (
          <div className={styles.articlesLayout}>
            <section className={styles.section} aria-labelledby="artigos-title">
              <div className={styles.sectionHeader}>
                <h2 id="artigos-title">Artigos recentes</h2>
                <Link href="/artigos">Todos os artigos →</Link>
              </div>
              <ul className={listing.postList}>
                {articles.slice(0, 5).map((article) => (
                  <li key={article.id}>
                    <PostCard entry={article} />
                  </li>
                ))}
              </ul>
            </section>

            <aside className={styles.sidebar} aria-label="Explorar artigos">
              <section aria-labelledby="categorias-title">
                <h2 id="categorias-title" className={styles.sidebarTitle}>
                  Navegar por categoria
                </h2>
                <CategoryNav categories={categories} className={styles.sidebarNav} />
              </section>
              <section aria-labelledby="populares-title">
                <h2 id="populares-title" className={styles.sidebarTitle}>
                  Mais populares
                </h2>
                <PopularList articles={popular} />
              </section>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
