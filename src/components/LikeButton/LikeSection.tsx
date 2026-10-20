import { useId } from "react";
import { MAX_LIKES_PER_VISITOR } from "@/lib/likes";
import { LikeButton } from "./LikeButton";
import styles from "./LikeSection.module.css";

/** Bloco "Gostou?" do fim de artigos e estudos de caso. */
export function LikeSection({ contentId, noun, title }: { contentId: string; noun: string; title: string }) {
  const titleId = useId();
  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      <p className={styles.lead}>Deixe uma curtida — ou dez. Ninguém está contando (bom, o contador está).</p>
      <LikeButton contentId={contentId} noun={noun} max={MAX_LIKES_PER_VISITOR} />
    </section>
  );
}
