import type { CSSProperties, ReactNode } from "react";
import styles from "./StackPill.module.css";

const PALETTE_SIZE = 6;

/**
 * Cor estável por tecnologia: um hash simples do nome escolhe um dos 6 pares de tokens
 * --color-pill-N-*. "React" tem sempre a mesma cor, em qualquer card ou filtro, sem
 * precisar cadastrar nada.
 */
export function pillColor(name: string) {
  let hash = 0;
  for (const char of name.toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return (hash % PALETTE_SIZE) + 1;
}

export function pillStyle(name: string) {
  const n = pillColor(name);
  return {
    "--pill-bg": `var(--color-pill-${n}-bg)`,
    "--pill-fg": `var(--color-pill-${n}-fg)`,
  } as CSSProperties;
}

export function StackPill({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <span className={styles.pill} style={pillStyle(name)}>
      {children ?? name}
    </span>
  );
}

export function StackList({ stack, label = "Tecnologias" }: { stack: string[]; label?: string }) {
  return (
    <ul className={styles.list} aria-label={label}>
      {stack.map((tech) => (
        <li key={tech}>
          <StackPill name={tech} />
        </li>
      ))}
    </ul>
  );
}
