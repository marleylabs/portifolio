import type { Metadata } from "next";
import { site } from "./site";

type PageMetadataOptions = {
  title?: string;
  description: string;
  /** Caminho canônico da página, ex.: "/css/molas-em-css". */
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  noIndex?: boolean;
  /** A rota tem opengraph-image próprio (artigos, projetos): não definimos imagem aqui. */
  hasOwnImage?: boolean;
};

/**
 * Metadata completa de uma página. Existe porque o Next SUBSTITUI (não mescla) o objeto
 * `openGraph` do layout quando a página define o seu — sem este helper, cada página
 * perderia siteName, locale, a imagem padrão e o link do RSS. As imagens vêm dos arquivos
 * opengraph-image (gerados no build).
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  noIndex,
  hasOwnImage,
}: PageMetadataOptions): Metadata {
  return {
    // Só quando definido: `title: undefined` explícito anula o título padrão do layout.
    ...(title && { title }),
    description,
    // `alternates` também substitui o do layout: repetimos o feed para não perder o
    // <link rel="alternate" type="application/rss+xml"> em nenhuma página.
    alternates: { canonical: path, types: { "application/rss+xml": "/rss.xml" } },
    openGraph: {
      type,
      locale: "pt_BR",
      siteName: site.name,
      url: path,
      title: title ?? site.title,
      description,
      // Imagem padrão do site (app/opengraph-image), que também se perderia na substituição.
      // Rotas com opengraph-image próprio não podem defini-la: aqui a config venceria o arquivo.
      ...(!hasOwnImage && { images: ["/opengraph-image"] }),
      ...(type === "article" && { publishedTime, modifiedTime, tags, authors: [site.name] }),
    },
    twitter: { card: "summary_large_image", title: title ?? site.title, description },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

/** JSON-LD serializado com segurança para dentro de <script> (sem "</script>" possível). */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
