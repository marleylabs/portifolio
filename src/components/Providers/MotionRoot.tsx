"use client";

import type { ReactNode } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

/**
 * Envolve componentes que usam Motion (`m.*`).
 * - LazyMotion + domAnimation: só as features de animação de DOM, sem drag/layout.
 * - Movimento reduzido vem do mesmo hook usado no resto do site (e não da detecção
 *   interna do Motion), então todas as animações obedecem à mesma fonte da verdade.
 */
export function MotionRoot({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={prefersReducedMotion ? "always" : "never"}>{children}</MotionConfig>
    </LazyMotion>
  );
}
