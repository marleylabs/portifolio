import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PostCard } from "@/components/PostCard/PostCard";
import { getAllArticles, getArticleCategories, getHighlights } from "@/lib/content";
import { site } from "@/lib/site";
import styles from "../listing.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Artigos",
  description: `Artigos de ${site.name} sobre desenvolvimento web, interfaces e engenharia de produto, com código comentado e o porquê de cada decisão técnica.`,
  path: "/artigos",
});

export default async function ArticlesPage() {
  const [articles, categories, highlights] = await Promise.all([
    getAllArticles(),
    getArticleCategories(),
    getHighlights({ limit: 3 }),
  ]);
  // Com poucos artigos, os destaques repetiriam a lista inteira logo abaixo.
  const showHighlights = articles.length > highlights.length + 2;

  return (
    <div className={styles.container}>
      <PageHeader
        title="Artigos"
        lead="Coisas que aprendi construindo produtos e que gostaria de ter lido antes."
      >
        <CategoryNav categories={categories} current="all" />
      </PageHeader>

      {showHighlights && (
        <section aria-labelledby="destaques" className={styles.section}>
          <h2 id="destaques" className={styles.sectionTitle}>
            Destaques
          </h2>
          <ul className={styles.postList}>
            {highlights.map((article) => (
              <li key={article.id}>
                <PostCard entry={article} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby={showHighlights ? "todos" : undefined} className={styles.section}>
        {showHighlights && (
          <h2 id="todos" className={styles.sectionTitle}>
            Todos os artigos
          </h2>
        )}
        <ul className={styles.postList}>
          {articles.map((article) => (
            <li key={article.id}>
              <PostCard entry={article} headingLevel={showHighlights ? 3 : 2} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
