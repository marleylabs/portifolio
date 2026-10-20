"use client";

import { useSearchParams } from "next/navigation";
import { ViewTransition, addTransitionType, startTransition, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard/ProjectCard";
import { pillStyle } from "@/components/StackPill/StackPill";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { PROJECT_AREAS, isProjectArea, type ProjectArea } from "@/lib/categories";
import type { ProjectSummary } from "@/lib/content";
import styles from "./ProjectExplorer.module.css";

type Technology = { name: string; count: number };

const PARAM = "stack";
const AREA_PARAM = "area";
// Capas da primeira linha: carregam já, com prioridade (são o maior elemento da tela).
const EAGER_COVERS = 2;
/*
 * Tipo da transição do filtro: os cards só animam quando a mudança vem dele. Navegar
 * para outra página (também uma transição, no Next) não dispara nada aqui.
 */
const FILTER = "filtro-projetos";
const onFilter = (className: string) => ({ [FILTER]: className, default: "none" });

/**
 * Grid de projetos com filtro por tecnologia e por área.
 *
 * - Os filtros vivem na URL (?stack=React, ?area=frontend): dá para compartilhar o link.
 *   A troca usa history.replaceState, sem ir ao servidor. A área vem dos planetas do hero
 *   e aparece como um chip removível; os dois filtros se somam.
 * - Área sem nenhum projeto: um estado vazio amigável, em vez de lista vazia.
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
  const [area, setArea] = useState<ProjectArea | null>(() => {
    const requested = searchParams.get(AREA_PARAM);
    return isProjectArea(requested) ? requested : null;
  });
  const areaInfo = area ? PROJECT_AREAS[area] : null;
  const inArea = area ? projects.filter((project) => project.area.includes(area)) : projects;
  const visible = selected ? inArea.filter(({ stack }) => stack.includes(selected)) : inArea;

  // Atualiza a URL e o estado (dentro de uma view transition, se as animações estiverem ligadas).
  function update(params: Record<string, string | null>, apply: () => void) {
    const url = new URL(window.location.href);
    for (const [param, value] of Object.entries(params)) {
      if (value) url.searchParams.set(param, value);
      else url.searchParams.delete(param);
    }
    window.history.replaceState(null, "", url);
    playSound("tick");

    if (paused) {
      apply();
      return;
    }
    startTransition(() => {
      addTransitionType(FILTER);
      apply();
    });
  }

  const select = (tech: string | null) => update({ [PARAM]: tech }, () => setSelected(tech));
  const clearArea = () => update({ [AREA_PARAM]: null }, () => setArea(null));
  const clearAll = () =>
    update({ [PARAM]: null, [AREA_PARAM]: null }, () => {
      setSelected(null);
      setArea(null);
    });
  // Área que existe, mas ainda sem nenhum projeto publicado.
  const areaIsEmpty = areaInfo !== null && inArea.length === 0;


  return (
    <>
      <FilterBar technologies={technologies} selected={selected} onSelect={select} total={projects.length} />

      {areaInfo && (
        <p className={styles.areaChip}>
          <span>
            Área: <strong>{areaInfo.label}</strong>
          </span>
          <button type="button" className={styles.areaClear} onClick={clearArea} aria-label={`Remover filtro de área: ${areaInfo.label}`}>
            ✕
          </button>
        </p>
      )}

      <p className="visually-hidden" role="status">
        {visible.length === 0
          ? "Nenhum projeto com esses filtros"
          : `${visible.length} ${visible.length === 1 ? "projeto" : "projetos"}${areaInfo ? ` de ${areaInfo.noun}` : ""}${selected ? ` com ${selected}` : ""}`}
      </p>

      {visible.length === 0 && (
        <div className={styles.empty}>
          <p>
            {areaIsEmpty
              ? `Ainda não publiquei projetos de ${areaInfo.noun} por aqui.`
              : "Nenhum projeto com essa combinação de filtros."}
          </p>
          <button type="button" className={styles.emptyAction} onClick={areaIsEmpty ? clearArea : clearAll}>
            {areaIsEmpty ? "Enquanto isso, veja os outros →" : "Limpar os filtros →"}
          </button>
        </div>
      )}

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
