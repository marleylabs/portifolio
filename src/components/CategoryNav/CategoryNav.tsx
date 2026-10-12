import Link from "next/link";
import type { ArticleCategory } from "@/lib/categories";
import styles from "./CategoryNav.module.css";

type CategoryNavProps = {
  categories: { key: ArticleCategory; label: string; count: number }[];
  /** Página atual: uma categoria, "all" (/artigos) ou nenhuma (ex.: na home). */
  current?: ArticleCategory | "all";
  className?: string;
};

export function CategoryNav({ categories, current, className }: CategoryNavProps) {
  return (
    <nav aria-label="Categorias de artigos" className={className ?? styles.nav}>
      <ul className={styles.list}>
        <li>
          <Link href="/artigos" className={styles.chip} aria-current={current === "all" ? "page" : undefined}>
            Todos
          </Link>
        </li>
        {categories.map(({ key, label, count }) => (
          <li key={key}>
            <Link href={`/${key}`} className={styles.chip} aria-current={current === key ? "page" : undefined}>
              {label}
              <span className={styles.count}>
                {count}
                <span className="visually-hidden"> {count === 1 ? "artigo" : "artigos"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
