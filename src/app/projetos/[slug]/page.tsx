import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HeaderBlocker } from "@/components/HeaderBlocker/HeaderBlocker";
import { LikeSection } from "@/components/LikeButton/LikeSection";
import { ExternalIcon } from "@/components/EntryLink/EntryLink";
import { GitHubIcon } from "@/components/icons/SocialIcons";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { StackList } from "@/components/StackPill/StackPill";
import { TableOfContents } from "@/components/TableOfContents/TableOfContents";
import { PROJECT_CATEGORIES } from "@/lib/categories";
import { formatDate, getAllProjects, getProject } from "@/lib/content";
import { MDXContent } from "@/lib/mdx";
import { extractHeadings } from "@/lib/toc";
import prose from "@/components/Prose/Prose.module.css";
import styles from "../../entry.module.css";

/** Só projetos com página interna: os externos (externalUrl) levam direto para fora. */
export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.filter(({ isExternal }) => !isExternal).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projetos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const { title, summary, publishedOn, updatedOn, tags } = project;
  return pageMetadata({
    title,
    description: summary,
    path: project.href,
    type: "article",
    hasOwnImage: true,
    publishedTime: publishedOn,
    modifiedTime: updatedOn,
    tags,
  });
}

/**
 * Estudo de caso: Problema → Solução → Arquitetura → Desafios → Resultado.
 * A estrutura é garantida no build (lib/content); aqui os ## ganham numeração (CSS)
 * e entram no sumário lateral, junto com a seção opcional "Como eu construí com IA".
 */
export default async function ProjectPage({ params }: PageProps<"/projetos/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { title, summary, role, stack, links, category, cover, publishedOn, updatedOn } = project;
  const headings = await extractHeadings(project.body);

  return (
    <article className={styles.container}>
      <PageHeader
        eyebrow={`Estudo de caso · ${PROJECT_CATEGORIES[category].label}`}
        title={title}
        lead={summary}
      >
        <dl className={styles.facts}>
          {role && (
            <div>
              <dt>Papel</dt>
              <dd>{role}</dd>
            </div>
          )}
          <div>
            <dt>Publicado</dt>
            <dd>
              <time dateTime={publishedOn}>{formatDate(publishedOn)}</time>
            </dd>
          </div>
          <div className={styles.factWide}>
            <dt>Stack</dt>
            <dd>
              <StackList stack={stack} />
            </dd>
          </div>
        </dl>

        {(links?.demo || links?.github) && (
          <div className={styles.projectLinks}>
            {links.demo && (
              <a href={links.demo} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                Ver demo
                <ExternalIcon />
                <span className="visually-hidden"> (abre em nova aba)</span>
              </a>
            )}
            {links.github && (
              <a href={links.github} className={styles.projectLink} target="_blank" rel="noopener noreferrer">
                <GitHubIcon className={styles.projectLinkIcon} />
                Código no GitHub
                <span className="visually-hidden"> (abre em nova aba)</span>
              </a>
            )}
          </div>
        )}
      </PageHeader>

      <div className={styles.cover}>
        {/* LCP da página. No Next 16, `priority` foi descontinuado: usamos o par recomendado. */}
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 72rem) 72rem, 100vw"
        />
      </div>

      <div className={styles.body}>
        <div className={`${prose.prose} ${styles.content} ${styles.caseStudy}`}>
          <MDXContent source={project.body} />
        </div>
        {headings.length >= 2 && (
          <aside className={styles.aside}>
            <HeaderBlocker />
            <TableOfContents headings={headings} title="Neste estudo de caso" />
          </aside>
        )}
      </div>

      <LikeSection contentId={`project:${project.id}`} noun="estudo de caso" title="Gostou deste estudo de caso?" />
      <footer className={styles.footer}>
        {updatedOn && (
          <p className={styles.updated}>
            Atualizado em <time dateTime={updatedOn}>{formatDate(updatedOn)}</time>
          </p>
        )}
        <Link href="/projetos">← Todos os projetos</Link>
      </footer>
    </article>
  );
}
