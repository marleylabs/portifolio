import "server-only";

import { cacheLife } from "next/cache";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeShiki from "@shikijs/rehype";
import rehypeSlug from "rehype-slug";
import rehypeUnwrapImages from "rehype-unwrap-images";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";
import { SHIKI_LANGS, SHIKI_THEMES, parseMetaString, shikiTransformers } from "./shiki";

/**
 * Compila MDX no servidor. O realce de sintaxe acontece aqui (Shiki), então o cliente
 * recebe HTML pronto, com as cores dos dois temas em CSS variables — trocar de tema
 * não exige nenhum JS.
 */
async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      // Conteúdo local e confiável: permite expressões JSX em props (ex.: items={[...]}).
      blockJS: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          // Imagem sozinha num parágrafo vira <figure>: tira o <p> em volta (HTML válido).
          rehypeUnwrapImages,
          [
            rehypeShiki,
            {
              themes: SHIKI_THEMES,
              defaultColor: false,
              langs: [...SHIKI_LANGS],
              fallbackLanguage: "txt",
              parseMetaString,
              transformers: shikiTransformers(),
            },
          ],
        ],
      },
    },
  });

  return content;
}

/**
 * O pipeline de MDX/Shiki usa Date.now() internamente; com "use cache" o resultado é
 * calculado no build e entra no HTML estático da página.
 */
export async function MDXContent({ source }: { source: string }) {
  "use cache";
  cacheLife("max");
  return renderMDX(source);
}
