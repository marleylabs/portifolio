import "server-only";

import { compile } from "@mdx-js/mdx";
import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import { cacheLife } from "next/cache";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import { BUILT_WITH_AI_ID, BUILT_WITH_AI_TITLE } from "@/components/mdx/BuiltWithAI";

export type TocHeading = { id: string; text: string; depth: 2 | 3 };

/**
 * Lista os h2/h3 de um MDX para o sumário lateral.
 *
 * Em vez de procurar "## " com regex, passa o texto pelo próprio compilador MDX com o
 * MESMO rehype-slug do render: os ids batem por construção, e código dentro de JSX
 * (ex.: um `# comentário` num <Playground>) nunca é confundido com um título.
 * O componente <BuiltWithAI> entra como um h2, na posição em que aparece.
 */
export async function extractHeadings(source: string): Promise<TocHeading[]> {
  "use cache";
  cacheLife("max");

  const headings: TocHeading[] = [];

  const collectHeadings = () => (tree: Root) => {
    visit(tree, (node) => {
      if (node.type === "element") {
        const element = node as Element;
        if ((element.tagName === "h2" || element.tagName === "h3") && typeof element.properties.id === "string") {
          headings.push({ id: element.properties.id, text: toString(element), depth: element.tagName === "h2" ? 2 : 3 });
        }
      } else if (node.type === "mdxJsxFlowElement" && "name" in node && node.name === "BuiltWithAI") {
        headings.push({ id: BUILT_WITH_AI_ID, text: BUILT_WITH_AI_TITLE, depth: 2 });
      }
    });
  };

  await compile(source, { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, collectHeadings] });
  return headings;
}
