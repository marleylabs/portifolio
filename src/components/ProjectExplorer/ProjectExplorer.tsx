"use client";

import { useSearchParams } from "next/navigation";
import { AnimatePresence, LazyMotion, MotionConfig, domMax, m } from "motion/react";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { pillStyle } from "@/components/StackPill/StackPill";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { ProjectSummary } from "@/lib/content";
import styles from "./ProjectExplorer.module.css";

type Technology = { name: string; count: number };

const PARAM = "stack";
const spring = { type: "spring", stiffness: 350, damping: 30 } as const;

/**
 * Grid de projetos com filtro por tecnologia.
 *
 * - O filtro vive na URL (?stack=React): dá para compartilhar o link. A troca usa
 *   history.replaceState — o Next sincroniza com useSearchParams sem ir ao servidor.
 * - Layout animations (Motion `layout`): cada card desliza da posição antiga para a
 *   nova; os que saem/entram encolhem/crescem. As features `domMax` (que incluem
 *   layout) só são baixadas nesta página.
 * - Movimento reduzido: o grid troca na hora, sem animação.
 */
export function ProjectExplorer({ projects, technologies }: { projects: ProjectSummary[]; technologies: Technology[] }) {
  const searchParams = useSearchParams();
  const prefersReducedMotion = usePrefersReducedMotion();
  const playSound = useSoundEffect();

  const requested = searchParams.get(PARAM);
  const selected = technologies.some(({ name }) => name === requested) ? requested : null;
  const visible = selected ? projects.filter(({ stack }) => stack.includes(selected)) : projects;
  // Movimento reduzido: entra/sai só com fade (opacidade não é movimento); sem escala.
  const hidden = prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 };

  function select(tech: string | null) {
    const url = new URL(window.location.href);
    if (tech) url.searchParams.set(PARAM, tech);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(null, "", url);
    playSound("tick");
  }

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>
        <FilterBar technologies={technologies} selected={selected} onSelect={select} total={projects.length} />

        <p className="visually-hidden" role="status">
          {selected
            ? `${visible.length} ${visible.length === 1 ? "projeto" : "projetos"} com ${selected}`
            : `Mostrando todos os ${projects.length} projetos`}
        </p>

        <ul className={styles.grid}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((project) => (
              <m.li
                key={project.id}
                layout
                initial={hidden}
                animate={{ opacity: 1, scale: 1 }}
                exit={hidden}
                transition={spring}
              >
                <ProjectCard entry={project} headingLevel={2} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </MotionConfig>
    </LazyMotion>
  );
}

type FilterBarProps = {
  technologies: Technology[];
  selected: string | null;
  onSelect?: (tech: string | null) => void;
  total: number;
};

/** Barra de filtros. Sem onSelect (fallback do servidor), os botões ficam desabilitados. */
export function FilterBar({ technologies, selected, onSelect, total }: FilterBarProps) {
  const disabled = !onSelect;

  return (
    <div className={styles.filters} role="group" aria-label="Filtrar projetos por tecnologia">
      <button
        type="button"
        className={styles.filter}
        aria-pressed={selected === null}
        disabled={disabled}
        onClick={() => onSelect?.(null)}
      >
        Todas <span className={styles.count}>{total}</span>
      </button>
      {technologies.map(({ name, count }) => (
        <button
          key={name}
          type="button"
          className={styles.filter}
          style={pillStyle(name)}
          data-colored
          aria-pressed={selected === name}
          disabled={disabled}
          onClick={() => onSelect?.(selected === name ? null : name)}
        >
          {name} <span className={styles.count}>{count}</span>
        </button>
      ))}
    </div>
  );
}

/** HTML estático do servidor: todos os projetos, sem filtro aplicado e sem Motion. */
export function ProjectExplorerFallback({ projects, technologies }: { projects: ProjectSummary[]; technologies: Technology[] }) {
  return (
    <>
      <FilterBar technologies={technologies} selected={null} total={projects.length} />
      <ul className={styles.grid}>
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectCard entry={project} headingLevel={2} />
          </li>
        ))}
      </ul>
    </>
  );
}
