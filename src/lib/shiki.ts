import "server-only";

import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";

/*
 * Configuração única do Shiki, usada por três caminhos: blocos ``` do Markdown
 * (rehype), o componente <CodeBlock> em JSX e a prévia estática do <Playground>.
 */

/*
 * Variantes "-default" do GitHub: todas as cores de texto passam AA (4.5:1) sobre os
 * nossos fundos de código. As clássicas não (github-light tem um laranja de 3.5:1 e o
 * github-dark, comentários de 3.5:1) — medido com o axe e um script de contraste.
 */
export const SHIKI_THEMES = { light: "github-light-default", dark: "github-dark-default" } as const;

export const SHIKI_LANGS = ["ts", "tsx", "js", "jsx", "css", "html", "json", "bash", "mdx", "sql", "diff"] as const;

/** Passa título e linguagem do bloco para o <pre> como data-* (a moldura os lê). */
const transformerCodeMeta: ShikiTransformer = {
  name: "code-meta",
  pre(node) {
    const title = this.options.meta?.title;
    if (typeof title === "string") node.properties["data-title"] = title;
    node.properties["data-language"] = this.options.lang;
  },
};

/**
 * Destaque de linhas, por dois caminhos:
 *   ```ts {2,4-6}          → intervalos na meta do bloco
 *   código // [!code highlight]   → anotação na própria linha
 * E diffs: // [!code ++] / // [!code --].
 */
export function shikiTransformers(): ShikiTransformer[] {
  return [transformerMetaHighlight(), transformerNotationHighlight(), transformerNotationDiff(), transformerCodeMeta];
}

/** ```ts title="arquivo.ts" {2-3} → { title: "arquivo.ts" } (o {2-3} fica no __raw). */
export function parseMetaString(meta: string) {
  const title = meta.match(/title="([^"]+)"/)?.[1];
  return title ? { title } : {};
}
