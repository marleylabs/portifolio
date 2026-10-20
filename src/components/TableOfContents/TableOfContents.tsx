"use client";

import { useEffect, useId, useState } from "react";
import type { TocHeading } from "@/lib/toc";
import styles from "./TableOfContents.module.css";

/**
 * Sumário lateral (sticky) com a seção atual destacada via IntersectionObserver.
 *
 * Observamos uma "faixa de leitura": do pé do header até 35% da altura da tela.
 * - Há títulos na faixa → o primeiro deles é a seção atual.
 * - Faixa vazia (no meio de uma seção longa) → vale o último título que já passou do
 *   topo. Isso só é calculado quando algum título entra ou sai da faixa — nada roda a
 *   cada pixel de rolagem.
 */
export function TableOfContents({ headings, title = "Neste artigo" }: { headings: TocHeading[]; title?: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const headerHeight = Math.round(document.querySelector("header")?.getBoundingClientRect().height ?? 0);
    const inBand = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target);
          else inBand.delete(entry.target);
        }

        const firstInBand = elements.find((element) => inBand.has(element));
        if (firstInBand) {
          setActiveId(firstInBand.id);
          return;
        }

        const passed = elements.filter((element) => element.getBoundingClientRect().top < headerHeight + 1);
        setActiveId(passed.at(-1)?.id ?? null);
      },
      { rootMargin: `-${headerHeight}px 0px -65% 0px` },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav className={styles.toc} aria-labelledby={titleId}>
      <h2 id={titleId} className={`label ${styles.title}`}>
        {title}
      </h2>
      <ol className={styles.list}>
        {headings.map(({ id, text, depth }) => (
          <li key={id} data-depth={depth}>
            <a href={`#${id}`} className={styles.link} aria-current={activeId === id ? "location" : undefined}>
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
