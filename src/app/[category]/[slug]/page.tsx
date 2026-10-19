import type { Metadata } from "next";
import { jsonLd, pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderBlocker } from "@/components/HeaderBlocker/HeaderBlocker";
import { LikeSection } from "@/components/LikeButton/LikeSection";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { TableOfContents } from "@/components/TableOfContents/TableOfContents";
import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { formatDate, getAllArticles, getArticle } from "@/lib/content";
import { MDXContent } from "@/lib/mdx";
import { extractHeadings } from "@/lib/toc";
import prose from "@/components/Prose/Prose.module.css";
import styles from "../../entry.module.css";

/** Só artigos com página interna: os externos (externalUrl) levam direto para fora. */
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.filter(({ isExternal }) => !isExternal).map(({ category, slug }) => ({ category, slug }));
}

export async function generateMetadata({ params }: PageProps<"/[category]/[slug]">): Promise<Metadata> {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) return {};

  const { title, summary, publishedOn, updatedOn, tags } = article;
  return pageMetadata({
    title,
    description: summary,
    path: article.href,
    type: "article",
    hasOwnImage: true,
    publishedTime: publishedOn,
    modifiedTime: updatedOn,
    tags,
  });
}

export default async function ArticlePage({ params }: PageProps<"/[category]/[slug]">) {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) notFound();

  const { title, summary, publishedOn, updatedOn, readingMinutes } = article;
  const categoryMeta = ARTICLE_CATEGORIES[article.category];
  const headings = await extractHeadings(article.body);

  return (
    <article className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description: summary,
          datePublished: publishedOn,
          dateModified: updatedOn ?? publishedOn,
          inLanguage: "pt-BR",
          keywords: article.tags.join(", "),
          image: `${site.url}${article.href}/opengraph-image`,
          mainEntityOfPage: `${site.url}${article.href}`,
          author: { "@type": "Person", name: site.name, url: site.url },
        })}
      />
      <PageHeader
        eyebrow={
          <Link href={`/${article.category}`} className={styles.categoryLink}>
            {categoryMeta.label}
          </Link>
        }
        title={title}
        lead={summary}
      >
        <ul className={styles.articleMeta}>
          <li>
            Publicado em <time dateTime={publishedOn}>{formatDate(publishedOn)}</time>
          </li>
          {updatedOn && (
            <li>
              Atualizado em <time dateTime={updatedOn}>{formatDate(updatedOn)}</time>
            </li>
          )}
          <li>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {readingMinutes} min de leitura
          </li>
        </ul>
      </PageHeader>
      <div className={styles.body}>
        <div className={`${prose.prose} ${styles.content}`}>
          <MDXContent source={article.body} />
        </div>
        {headings.length >= 2 && (
          <aside className={styles.aside}>
            <HeaderBlocker />
            <TableOfContents headings={headings} />
          </aside>
        )}
      </div>
      <LikeSection contentId={`article:${article.id}`} noun="artigo" title="Gostou do artigo?" />
      <footer className={styles.footer}>
        <nav aria-label="Mais artigos" className={styles.footerLinks}>
          <Link href={`/${article.category}`}>← Mais sobre {categoryMeta.label}</Link>
          <Link href="/artigos">← Todos os artigos</Link>
        </nav>
      </footer>
    </article>
  );
}
