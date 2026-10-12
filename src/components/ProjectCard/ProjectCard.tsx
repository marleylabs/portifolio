import Image from "next/image";
import { EntryLink } from "@/components/EntryLink/EntryLink";
import { StackList } from "@/components/StackPill/StackPill";
import { PROJECT_CATEGORIES } from "@/lib/categories";
import type { ProjectSummary } from "@/lib/content";
import styles from "./ProjectCard.module.css";

/**
 * Card de projeto. O link do título cobre o card inteiro (área de clique grande) sem
 * aninhar elementos interativos; hover/foco elevam o card com mola e aproximam a capa.
 * Sem hooks: pode ser usado tanto no servidor (home) quanto no explorer com filtro.
 */
type ProjectCardProps = {
  entry: ProjectSummary;
  eager?: boolean;
  /** 2 quando o card fica direto abaixo do h1 da página; 3 dentro de uma seção com h2. */
  headingLevel?: 2 | 3;
};

export function ProjectCard({ entry, eager = false, headingLevel = 3 }: ProjectCardProps) {
  const Heading = `h${headingLevel}` as const;
  const { title, summary, stack, category, cover, href, isExternal, publishedOn } = entry;

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 72rem) 22rem, (min-width: 40rem) 45vw, 100vw"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>
          {PROJECT_CATEGORIES[category].label} · {publishedOn.slice(0, 4)}
        </p>
        <Heading className={styles.title}>
          <EntryLink href={href} isExternal={isExternal} className={styles.link}>
            {title}
          </EntryLink>
        </Heading>
        <p className={styles.description}>{summary}</p>
        <div className={styles.stack}>
          <StackList stack={stack} />
        </div>
      </div>
    </article>
  );
}
