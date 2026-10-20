import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { PostCard } from "@/components/PostCard/PostCard";
import { ARTICLE_CATEGORIES, isArticleCategory } from "@/lib/categories";
import { getArticleCategories, getArticlesByCategory } from "@/lib/content";
import styles from "../listing.module.css";

/*
 * Todo o conteúdo é conhecido no build. Um endereço fora do generateStaticParams é sempre
 * um 404, e o notFound() precisa rodar antes do streaming para responder com status 404.
 * Por isso esta rota pode bloquear em vez de servir um App Shell com <Suspense>.
 */
export const instant = false;

/** Uma página por categoria que tenha ao menos um artigo. */
export async function generateStaticParams() {
  return (await getArticleCategories()).map(({ key }) => ({ category: key }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const { category } = await params;
  // Mesma regra da página: só categorias com artigos (as demais são 404).
  if (!isArticleCategory(category) || !(await getArticleCategories()).some(({ key }) => key === category)) notFound();
  const { label, description } = ARTICLE_CATEGORIES[category];
  return pageMetadata({ title: `Artigos sobre ${label}`, description, path: `/${category}` });
}

export default async function CategoryPage({ params }: PageProps<"/[category]">) {
  const { category } = await params;
  if (!isArticleCategory(category)) notFound();

  const [articles, categories] = await Promise.all([getArticlesByCategory(category), getArticleCategories()]);
  if (articles.length === 0) notFound();

  const { label, description } = ARTICLE_CATEGORIES[category];

  return (
    <div className={styles.container}>
      <PageHeader eyebrow="Artigos" title={label} lead={description}>
        <CategoryNav categories={categories} current={category} />
      </PageHeader>
      <ul className={styles.postList}>
        {articles.map((article) => (
          <li key={article.id}>
            <PostCard entry={article} showCategory={false} headingLevel={2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
