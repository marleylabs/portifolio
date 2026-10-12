import type { ReactNode } from "react";
import { StackList } from "@/components/StackPill/StackPill";
import styles from "./BuiltWithAI.module.css";

/** Id fixo: o sumário lateral (lib/toc) aponta para ele. */
export const BUILT_WITH_AI_ID = "como-eu-construi-com-ia";
export const BUILT_WITH_AI_TITLE = "Como eu construí com IA";

/**
 * Seção opcional dos estudos de caso. Uso no MDX:
 *
 *   <BuiltWithAI tools={["Claude Code", "Cursor"]}>
 *   Texto em Markdown: o que a IA fez, o que você revisou, prompts que funcionaram…
 *   </BuiltWithAI>
 *
 * É um componente (e não um ## comum) para ter visual próprio e ficar fora da
 * numeração Problema → Resultado.
 */
export function BuiltWithAI({ tools, children }: { tools?: string[]; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={BUILT_WITH_AI_ID}>
      <h2 id={BUILT_WITH_AI_ID} className={styles.title}>
        <svg className={styles.icon} viewBox="0 0 136 136" aria-hidden="true">
          <path d="M68 0Q74 62 136 68Q74 74 68 136Q62 74 0 68Q62 62 68 0Z" />
        </svg>
        <a href={`#${BUILT_WITH_AI_ID}`} className={styles.anchor}>
          {BUILT_WITH_AI_TITLE}
        </a>
      </h2>
      {tools && tools.length > 0 && (
        <div className={styles.tools}>
          <StackList stack={tools} label="Ferramentas de IA usadas" />
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </section>
  );
}
