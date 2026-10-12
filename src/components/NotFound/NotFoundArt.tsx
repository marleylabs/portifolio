"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useRandomInterval } from "@/hooks/use-random-interval";
import styles from "./NotFound.module.css";

const MAX_LOOK = 5; // quanto as pupilas andam (unidades do viewBox)

/**
 * "404" em que o 0 é o mascote, perdido e de boca aberta. Os olhos seguem o cursor
 * (escrevendo direto no DOM, no máximo uma vez por frame — sem re-render) e piscam de
 * vez em quando. Os "4" balançam devagar. Movimento reduzido: tudo parado.
 */
export function NotFoundArt() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const faceRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let frame = 0;
    let pointer = { x: 0, y: 0 };

    const update = () => {
      frame = 0;
      const face = faceRef.current?.getBoundingClientRect();
      if (!face || !pupilsRef.current) return;
      const dx = pointer.x - (face.left + face.width / 2);
      const dy = pointer.y - (face.top + face.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, distance / 300) * MAX_LOOK;
      pupilsRef.current.style.transform = `translate(${(dx / distance) * reach}px, ${(dy / distance) * reach}px)`;
    };

    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion]);

  const blink = useCallback(() => setIsBlinking(true), []);
  const ambientPaused = useAmbientMotionPaused();
  useRandomInterval(blink, ambientPaused ? null : 2000, ambientPaused ? null : 5000);
  useEffect(() => {
    if (!isBlinking) return;
    const id = window.setTimeout(() => setIsBlinking(false), 140);
    return () => window.clearTimeout(id);
  }, [isBlinking]);

  return (
    <div className={styles.art} aria-hidden="true" data-blinking={isBlinking}>
      <span className={styles.digit}>4</span>
      <svg ref={faceRef} className={styles.face} viewBox="0 0 120 120">
        <defs>
          <linearGradient id="nf-skin" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--color-sparkle)" }} />
            <stop offset="55%" style={{ stopColor: "var(--color-primary)" }} />
            <stop offset="100%" style={{ stopColor: "var(--color-accent)" }} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="54" fill="url(#nf-skin)" />
        <ellipse cx="40" cy="36" rx="11" ry="6" transform="rotate(-30 40 36)" style={{ fill: "var(--color-mascot-shine)" }} opacity="0.35" />
        {/* Olhos: brancos fixos, pupilas móveis */}
        <g className={styles.eyes}>
          <circle cx="43" cy="54" r="12" style={{ fill: "var(--color-mascot-shine)" }} />
          <circle cx="77" cy="54" r="12" style={{ fill: "var(--color-mascot-shine)" }} />
          <g ref={pupilsRef} className={styles.pupils}>
            <circle cx="43" cy="54" r="5.5" style={{ fill: "var(--color-mascot-ink)" }} />
            <circle cx="77" cy="54" r="5.5" style={{ fill: "var(--color-mascot-ink)" }} />
          </g>
        </g>
        {/* Boca de "ué?" */}
        <ellipse cx="60" cy="88" rx="7" ry="9" style={{ fill: "var(--color-mascot-ink)" }} />
      </svg>
      <span className={styles.digit}>4</span>
    </div>
  );
}
