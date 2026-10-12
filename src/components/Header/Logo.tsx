"use client";

import Link from "next/link";
import { Fragment, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { site } from "@/lib/site";
import { springToLinear } from "@/lib/spring";
import styles from "./Header.module.css";

// Palavras → letras com índice global (para o stagger), calculado uma vez só.
const WORDS = (() => {
  let index = 0;
  return site.name.split(" ").map((word) => [...word].map((char) => ({ char, index: index++ })));
})();

const STAGGER = 30;
const RISE_DURATION = 180;
// Descida com uma mola mais solta que a do resto do site: as letras "assentam" quicando.
const DESCENT = springToLinear({ stiffness: 260, damping: 12 });
const HOP_DURATION = RISE_DURATION + DESCENT.duration;

/**
 * Logo em texto: no hover/foco, cada letra dá um pulinho, uma depois da outra.
 * Usa a Web Animations API direto no DOM (sem re-render do React, sem lib): a subida
 * é rápida e a descida é uma mola (linear() gerado em lib/spring), que passa um pouco
 * do ponto e assenta. Letras ainda em movimento não são reiniciadas, então não há "tranco".
 */
export function Logo() {
  const lettersRef = useRef<HTMLSpanElement[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();

  function hop() {
    if (prefersReducedMotion) return;

    lettersRef.current.forEach((letter, index) => {
      if (letter.getAnimations().length > 0) return;
      const keyframes = (descent: string): Keyframe[] => [
        { transform: "translateY(0)", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        { transform: "translateY(-0.3em)", offset: RISE_DURATION / HOP_DURATION, easing: descent },
        { transform: "translateY(0)" },
      ];
      const options = { duration: HOP_DURATION, delay: index * STAGGER };
      try {
        letter.animate(keyframes(DESCENT.easing), options);
      } catch {
        // Navegador sem suporte a linear() na Web Animations API.
        letter.animate(keyframes("ease-out"), options);
      }
    });
  }

  return (
    <Link
      href="/"
      className={styles.logo}
      aria-label={`${site.name} — página inicial`}
      onPointerEnter={hop}
      onFocus={hop}
    >
      {WORDS.map((letters, wordIndex) => (
        <Fragment key={letters[0].index}>
          {/* Espaço de verdade entre as palavras (renderizado, não só um gap de CSS): o
              texto visível "Anderson Marley" precisa fazer parte do nome acessível. */}
          {wordIndex > 0 && " "}
          <span className={styles.logoWord} aria-hidden="true">
            {letters.map(({ char, index }) => (
              <span
                key={index}
                className={styles.logoLetter}
                ref={(element) => {
                  if (element) lettersRef.current[index] = element;
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Link>
  );
}
