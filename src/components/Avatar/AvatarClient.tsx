"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useBoop } from "@/hooks/use-boop";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRandomInterval } from "@/hooks/use-random-interval";
import styles from "./Avatar.module.css";

const BLINK_DURATION = 150;

/**
 * Camadas, de fora para dentro (cada uma com um único transform, para não brigarem):
 *   .avatar   → recebe o hover
 *   .breathe  → "respiração" contínua (keyframes CSS)
 *   .tilt     → inclinação com mola no hover (useBoop, volta sozinha)
 * A piscada é um atributo (data-blinking) lido pelo CSS: troca de frame no PNG ou
 * fecha os olhos do mascote SVG. Pisca no hover e, de vez em quando, sozinho.
 *
 * O desenho (mascote ou PNGs) vem pronto do servidor como children: o SVG do mascote
 * não precisa ir no JavaScript do navegador.
 */
export function AvatarClient({ children }: { children: ReactNode }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [tiltStyle, tilt] = useBoop({
    rotation: -8,
    scale: 1.04,
    timing: 350,
    springConfig: { stiffness: 220, damping: 12 },
  });
  const [isBlinking, setIsBlinking] = useState(false);

  const blink = useCallback(() => setIsBlinking(true), []);

  useEffect(() => {
    if (!isBlinking) return;
    const id = window.setTimeout(() => setIsBlinking(false), BLINK_DURATION);
    return () => window.clearTimeout(id);
  }, [isBlinking]);

  // Piscadas espontâneas, em ritmo irregular (como as de verdade).
  // Param com o botão "Pausar animações"; a piscada ao passar o mouse continua (é resposta a um gesto).
  const ambientPaused = useAmbientMotionPaused();
  useRandomInterval(blink, ambientPaused ? null : 2500, ambientPaused ? null : 6500);

  function handlePointerEnter() {
    tilt();
    if (!prefersReducedMotion) blink();
  }

  return (
    <div className={styles.avatar} onPointerEnter={handlePointerEnter} data-blinking={isBlinking}>
      <div className={styles.breathe}>
        <div className={styles.tilt} style={tiltStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}
