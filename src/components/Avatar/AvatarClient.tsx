"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useBoop } from "@/hooks/use-boop";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRandomInterval } from "@/hooks/use-random-interval";
import { Mascot } from "./Mascot";
import styles from "./Avatar.module.css";

export type AvatarImages = {
  light: string;
  dark: string;
  blinkLight: string | null;
  blinkDark: string | null;
};

const BLINK_DURATION = 150;
const SIZES = "(min-width: 56rem) 320px, 220px";

/**
 * Camadas, de fora para dentro (cada uma com um único transform, para não brigarem):
 *   .avatar   → recebe o hover
 *   .breathe  → "respiração" contínua (keyframes CSS)
 *   .tilt     → inclinação com mola no hover (useBoop, volta sozinha)
 * A piscada é um atributo (data-blinking) lido pelo CSS: troca de frame no PNG ou
 * fecha os olhos do mascote SVG. Pisca no hover e, de vez em quando, sozinho.
 */
export function AvatarClient({ images, alt }: { images: AvatarImages | null; alt: string }) {
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
          {images ? (
            <>
              <ThemeFrame variant="light" src={images.light} blinkSrc={images.blinkLight} alt={alt} />
              <ThemeFrame variant="dark" src={images.dark} blinkSrc={images.blinkDark} alt={alt} />
            </>
          ) : (
            <Mascot title={alt} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Uma versão por tema; o CSS esconde a do outro tema com display: none. Com loading
 * lazy, a imagem escondida nem chega a ser baixada.
 */
function ThemeFrame({
  variant,
  src,
  blinkSrc,
  alt,
}: {
  variant: "light" | "dark";
  src: string;
  blinkSrc: string | null;
  alt: string;
}) {
  return (
    <div className={styles.frame} data-variant={variant}>
      <Image src={src} alt={alt} fill sizes={SIZES} className={styles.image} />
      {blinkSrc && (
        <Image src={blinkSrc} alt="" fill sizes={SIZES} className={`${styles.image} ${styles.blinkImage}`} />
      )}
    </div>
  );
}
