import { ARTICLE_CATEGORIES } from "@/lib/categories";
import { formatDate, getAllArticles, getArticle } from "@/lib/content";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Card de compartilhamento do artigo, com o título sobre um fundo com ondas coloridas";
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.filter(({ isExternal }) => !isExternal).map(({ category, slug }) => ({ category, slug }));
}

export default async function Image({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  const article = await getArticle(category, slug);
  if (!article) throw new Error(`Artigo não encontrado: ${category}/${slug}`);

  return renderOgImage({
    eyebrow: `Artigo · ${ARTICLE_CATEGORIES[article.category].label}`,
    title: article.title,
    meta: `${formatDate(article.publishedOn)} · ${article.readingMinutes} min de leitura`,
  });
}
