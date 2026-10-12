import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PostCard } from "@/components/PostCard/PostCard";
import { getAllArticles, getArticleCategories, getPopular } from "@/lib/content";
import styles from "../listing.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Artigos",
  description: "Artigos sobre desenvolvimento web, interfaces e engenharia de produto.",
  path: "/artigos",
});

export default async function ArticlesPage() {
  const [articles, categories, popular] = await Promise.all([
    getAllArticles(),
    getArticleCategories(),
    getPopular({ limit: 3 }),
  ]);
  // Com poucos artigos, "mais lidos" repetiria a lista inteira logo abaixo.
  const showPopular = articles.length > popular.length + 2;

  return (
    <div className={styles.container}>
      <PageHeader
        title="Artigos"
        lead="Coisas que aprendi construindo produtos e que gostaria de ter lido antes."
      >
        <CategoryNav categories={categories} current="all" />
      </PageHeader>

      {showPopular && (
        <section aria-labelledby="populares" className={styles.section}>
          <h2 id="populares" className={styles.sectionTitle}>
            Mais lidos
          </h2>
          <ul className={styles.postList}>
            {popular.map((article) => (
              <li key={article.id}>
                <PostCard entry={article} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby={showPopular ? "todos" : undefined} className={styles.section}>
        {showPopular && (
          <h2 id="todos" className={styles.sectionTitle}>
            Todos os artigos
          </h2>
        )}
        <ul className={styles.postList}>
          {articles.map((article) => (
            <li key={article.id}>
              <PostCard entry={article} headingLevel={showPopular ? 3 : 2} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
