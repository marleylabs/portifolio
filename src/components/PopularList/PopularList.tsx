import { EntryLink } from "@/components/EntryLink/EntryLink";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import type { ArticleSummary } from "@/lib/content";
import styles from "./PopularList.module.css";

/**
 * Lista numerada dos mais lidos. O número grande é decorativo (aria-hidden): a ordem
 * já vem do próprio <ol>. role="list" porque o Safari remove a semântica de listas
 * com list-style: none.
 */
export function PopularList({ articles }: { articles: ArticleSummary[] }) {
  return (
    <ol className={styles.list} role="list">
      {articles.map((article, index) => (
        <li key={article.id} className={styles.item}>
          <span className={styles.number} aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div>
            <EntryLink href={article.href} isExternal={article.isExternal} className={styles.link}>
              {article.title}
            </EntryLink>
            <p className={styles.meta}>{ARTICLE_CATEGORIES[article.category].label}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
