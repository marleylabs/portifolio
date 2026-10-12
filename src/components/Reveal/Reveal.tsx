"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Revela os descendentes marcados com `data-reveal` quando entram na viewport.
 *
 * - O HTML chega com tudo visível (sem JS, nada fica escondido).
 * - Antes da primeira pintura após hidratar, só os itens ABAIXO da dobra são
 *   escondidos (data-revealed="false"); o que já está na tela nunca "pisca".
 * - Cada item é revelado ao entrar e deixa de ser observado (anima uma vez).
 * - Movimento reduzido: nada é escondido nem animado.
 * O visual (fade + subida com mola) fica no CSS global, em [data-revealed].
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion) return;

    const items = [...root.querySelectorAll<HTMLElement>("[data-reveal]")].filter(
      (item) => item.getBoundingClientRect().top > window.innerHeight,
    );
    for (const item of items) item.dataset.revealed = "false";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "true";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    for (const item of items) observer.observe(item);

    return () => {
      observer.disconnect();
      for (const item of items) item.dataset.revealed = "true";
    };
  }, [prefersReducedMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
