import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import { ProjectExplorer, ProjectExplorerFallback } from "@/components/ProjectExplorer/ProjectExplorer";
import { getAllProjects, getProjectTechnologies } from "@/lib/content";
import styles from "../listing.module.css";

export const metadata: Metadata = pageMetadata({
  title: "Projetos",
  description: "Estudos de caso: o problema, as decisões e o resultado de cada projeto.",
  path: "/projetos",
});

export default async function ProjectsPage() {
  const [projects, technologies] = await Promise.all([getAllProjects(), getProjectTechnologies()]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Projetos"
        lead="Estudos de caso: qual era o problema, que decisões tomei e o que aconteceu depois."
      />
      {/*
        O filtro lê ?stack= da URL (useSearchParams), algo que só existe no navegador.
        O HTML estático leva o fallback — o grid completo — e o explorer assume na
        hidratação. Sem filtro na URL, as duas versões são idênticas: nada pisca.
      */}
      <Suspense fallback={<ProjectExplorerFallback projects={projects} technologies={technologies} />}>
        <ProjectExplorer projects={projects} technologies={technologies} />
      </Suspense>
    </div>
  );
}
