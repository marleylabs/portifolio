"use client";

import { useSearchParams } from "next/navigation";
import { ViewTransition, addTransitionType, startTransition, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { pillStyle } from "@/components/StackPill/StackPill";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import type { ProjectSummary } from "@/lib/content";
import styles from "./ProjectExplorer.module.css";

type Technology = { name: string; count: number };

const PARAM = "stack";
// Capas da primeira linha: carregam já, com prioridade (são o maior elemento da tela).
const EAGER_COVERS = 2;
/*
 * Tipo da transição do filtro: os cards só animam quando a mudança vem dele. Navegar
 * para outra página (também uma transição, no Next) não dispara nada aqui.
 */
const FILTER = "filtro-projetos";
const onFilter = (className: string) => ({ [FILTER]: className, default: "none" });

/**
 * Grid de projetos com filtro por tecnologia.
 *
 * - O filtro vive na URL (?stack=React): dá para compartilhar o link. A troca usa
 *   history.replaceState, sem ir ao servidor.
 * - Animação nativa (View Transitions, via <ViewTransition> do React): cada card desliza
 *   da posição antiga para a nova com a mola do site (--ease-spring, em globals.css); os
 *   que entram crescem, os que saem encolhem. Zero JS de animação no bundle.
 * - Com "Pausar animações" ou movimento reduzido, a troca acontece fora de uma
 *   transição: o grid muda na hora. Navegador sem suporte: idem.
 */
export function ProjectExplorer({ projects, technologies }: { projects: ProjectSummary[]; technologies: Technology[] }) {
  const searchParams = useSearchParams();
  const paused = useAmbientMotionPaused();
  const playSound = useSoundEffect();

  const isValid = (tech: string | null) => technologies.some(({ name }) => name === tech);
  const [selected, setSelected] = useState(() => {
    const requested = searchParams.get(PARAM);
    return isValid(requested) ? requested : null;
  });
  const visible = selected ? projects.filter(({ stack }) => stack.includes(selected)) : projects;

  function select(tech: string | null) {
    const url = new URL(window.location.href);
    if (tech) url.searchParams.set(PARAM, tech);
    else url.searchParams.delete(PARAM);
    window.history.replaceState(null, "", url);
    playSound("tick");

    if (paused) {
      setSelected(tech);
      return;
    }
    startTransition(() => {
      addTransitionType(FILTER);
      setSelected(tech);
    });
  }

  return (
    <>
      <FilterBar technologies={technologies} selected={selected} onSelect={select} total={projects.length} />

      <p className="visually-hidden" role="status">
        {selected
          ? `${visible.length} ${visible.length === 1 ? "projeto" : "projetos"} com ${selected}`
          : `Mostrando todos os ${projects.length} projetos`}
      </p>

      <ul className={styles.grid}>
        {visible.map((project, index) => (
          <ViewTransition
            key={project.id}
            default="none"
            update={onFilter("project-move")}
            enter={onFilter("project-enter")}
            exit={onFilter("project-exit")}
          >
            <li>
              <ProjectCard entry={project} headingLevel={2} eager={index < EAGER_COVERS} />
            </li>
          </ViewTransition>
        ))}
      </ul>
    </>
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
        {projects.map((project, index) => (
          <li key={project.id}>
            <ProjectCard entry={project} headingLevel={2} eager={index < EAGER_COVERS} />
          </li>
        ))}
      </ul>
    </>
  );
}
