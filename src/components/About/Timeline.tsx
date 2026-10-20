import { Reveal } from "@/components/Reveal/Reveal";
import type { AboutPage } from "@/lib/content";
import styles from "./About.module.css";

/** Linha do tempo da carreira: cada etapa sobe ao entrar na tela e o marcador "estala". */
export function Timeline({ items }: { items: AboutPage["timeline"] }) {
  return (
    <Reveal>
      <ol className={styles.timeline} role="list">
        {items.map((item) => (
          <li key={`${item.period}-${item.role}`} className={styles.timelineItem} data-reveal>
            <span className={styles.dot} aria-hidden="true" />
            <p className={styles.period}>{item.period}</p>
            <div className={styles.card}>
              <h3 className={styles.role}>
                {item.role}
              </h3>
              <p className={styles.organization}>{item.organization}</p>
              <p className={styles.description}>{item.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
