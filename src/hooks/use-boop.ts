"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { springToLinear, type SpringConfig } from "@/lib/spring";
import { usePrefersReducedMotion } from "./use-prefers-reduced-motion";

export type BoopConfig = {
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
  /** Quanto tempo (ms) o elemento fica "booped" antes de a mola puxá-lo de volta. */
  timing?: number;
  springConfig?: SpringConfig;
};

/**
 * "Boop": um empurrãozinho que volta sozinho. `trigger` desloca o elemento; depois de
 * `timing` ms o estado volta e a mola o traz de volta — mesmo que o mouse continue em
 * cima. É um gesto, não um estado de hover.
 *
 * Devolve [style, trigger] separados para permitir "boops desconectados": o gatilho no
 * botão inteiro, a animação só no ícone.
 *
 * A mola é CSS puro (`linear()` gerado a partir de stiffness/damping), sem lib de
 * animação. O elemento animado precisa ser inline-block/block para aceitar transform.
 */
export function useBoop({
  x = 0,
  y = 0,
  rotation = 0,
  scale = 1,
  timing = 150,
  springConfig,
}: BoopConfig = {}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isBooped, setIsBooped] = useState(false);

  const { stiffness = 300, damping = 10, mass = 1 } = springConfig ?? {};
  const spring = useMemo(() => springToLinear({ stiffness, damping, mass }), [stiffness, damping, mass]);

  useEffect(() => {
    if (!isBooped) return;
    const id = window.setTimeout(() => setIsBooped(false), timing);
    return () => window.clearTimeout(id);
  }, [isBooped, timing]);

  const trigger = useCallback(() => setIsBooped(true), []);

  const style: CSSProperties = prefersReducedMotion
    ? {}
    : {
        transform: isBooped
          ? `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`
          : "translate(0px, 0px) rotate(0deg) scale(1)",
        transition: `transform ${spring.duration}ms ${spring.easing}`,
      };

  return [style, trigger] as const;
}
