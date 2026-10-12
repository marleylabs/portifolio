import { EntryLink } from "@/components/EntryLink/EntryLink";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { formatDate, type ArticleSummary } from "@/lib/content";
import styles from "./PostCard.module.css";

type PostCardProps = {
  entry: ArticleSummary;
  showCategory?: boolean;
  /** 2 quando o card fica direto abaixo do h1 da página; 3 dentro de uma seção com h2. */
  headingLevel?: 2 | 3;
};

export function PostCard({ entry, showCategory = true, headingLevel = 3 }: PostCardProps) {
  const Heading = `h${headingLevel}` as const;
  const { title, summary, publishedOn, category, href, isExternal, externalHost, readingMinutes } = entry;

  return (
    <article className={styles.card}>
      {showCategory && <p className={styles.category}>{ARTICLE_CATEGORIES[category].label}</p>}
      <Heading className={styles.title}>
        <EntryLink href={href} isExternal={isExternal} className={styles.link}>
          {title}
        </EntryLink>
      </Heading>
      <p className={styles.description}>{summary}</p>
      <p className={styles.meta}>
        <time dateTime={publishedOn}>{formatDate(publishedOn)}</time>
        <span aria-hidden="true"> · </span>
        {isExternal ? `Publicado em ${externalHost}` : `${readingMinutes} min de leitura`}
      </p>
      {/*
        Pista visual: o link de verdade é o título (que cobre o card inteiro), então
        este "Ler mais" fica fora da árvore de acessibilidade para não repetir o link.
      */}
      <span className={styles.readMore} data-external={isExternal} aria-hidden="true">
        {isExternal ? `Ler no ${externalHost}` : "Ler mais"}
        <span className={styles.arrow}>{isExternal ? "↗" : "→"}</span>
      </span>
    </article>
  );
}
