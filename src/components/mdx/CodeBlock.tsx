import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { codeToHtml } from "shiki";
import { SHIKI_THEMES, shikiTransformers } from "@/lib/shiki";
import { CopyButton } from "./CopyButton";
import styles from "./CodeBlock.module.css";

const LANGUAGE_NAMES: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  css: "CSS",
  html: "HTML",
  json: "JSON",
  bash: "Terminal",
  mdx: "MDX",
  sql: "SQL",
  diff: "Diff",
};

/**
 * Moldura comum a todo bloco de código: rótulo (nome do arquivo ou linguagem) e botão
 * de copiar. O realce vem pronto do servidor (Shiki); só o botão é Client Component.
 */
export function CodeFrame({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.toolbar}>
        {label ? <figcaption className={styles.caption}>{label}</figcaption> : <span />}
        <CopyButton />
      </div>
      {children}
    </figure>
  );
}

type PreProps = ComponentPropsWithoutRef<"pre"> & {
  "data-title"?: string;
  "data-language"?: string;
};

/** Blocos ``` do Markdown: o rehype-shiki entrega o <pre> realçado; aqui só emolduramos. */
export function CodeBlockPre({ "data-title": title, "data-language": language, ...props }: PreProps) {
  return (
    <CodeFrame label={title ?? (language ? LANGUAGE_NAMES[language] : undefined)}>
      <pre {...props} tabIndex={0} />
    </CodeFrame>
  );
}

type CodeBlockProps = {
  code: string;
  lang?: string;
  /** Nome do arquivo exibido na moldura. */
  filename?: string;
  /** Linhas destacadas, ex.: "2,4-6". */
  highlight?: string;
};

/**
 * Versão JSX, para quando o código vem de uma variável ou precisa de props:
 *
 *   <CodeBlock lang="ts" filename="soma.ts" highlight="2" code={`...`} />
 *
 * Mesmo resultado de um bloco ```ts title="soma.ts" {2}.
 */
export async function CodeBlock({ code, lang = "txt", filename, highlight }: CodeBlockProps) {
  const html = await codeToHtml(code.replace(/^\n+|\s+$/g, ""), {
    lang,
    themes: SHIKI_THEMES,
    defaultColor: false,
    meta: { __raw: highlight ? `{${highlight}}` : "" },
    transformers: shikiTransformers(),
  });

  return (
    <CodeFrame label={filename ?? LANGUAGE_NAMES[lang]}>
      {/* HTML gerado pelo Shiki a partir de conteúdo local (confiável), no build. */}
      <div className={styles.html} dangerouslySetInnerHTML={{ __html: html }} />
    </CodeFrame>
  );
}
