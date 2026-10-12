import { Reveal } from "@/components/Reveal/Reveal";
import { pillStyle } from "@/components/StackPill/StackPill";
import type { AboutPage } from "@/lib/content";
import styles from "./About.module.css";

/** "Stack atual": um card por grupo; cada tecnologia na cor da sua pílula (a mesma do site todo). */
export function StackGrid({ groups }: { groups: AboutPage["stack"] }) {
  return (
    <Reveal className={styles.stackGrid}>
      {groups.map((group) => (
        <section key={group.group} className={styles.stackGroup} aria-label={group.group} data-reveal>
          <h3 className={styles.stackTitle}>
            {group.group}
            {group.example && <span className="example-badge">exemplo</span>}
          </h3>
          <ul className={styles.stackList} role="list">
            {group.items.map((item) => (
              <li key={item.name} className={styles.stackItem} style={pillStyle(item.name)}>
                <span className={styles.stackName}>{item.name}</span>
                <span className={styles.stackNote}>{item.note}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Reveal>
  );
}
