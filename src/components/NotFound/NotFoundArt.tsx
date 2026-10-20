"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAmbientMotionPaused } from "@/hooks/use-preferences";
import { useEyeTracking } from "@/hooks/use-eye-tracking";
import { useRandomInterval } from "@/hooks/use-random-interval";
import styles from "./NotFound.module.css";

const MAX_LOOK = 5; // quanto as pupilas andam (unidades do viewBox)

/**
 * "404" em que o 0 é um planeta que escapou da órbita, de boca aberta. Os olhos seguem o
 * cursor (useEyeTracking) e piscam de vez em quando. Os "4" balançam devagar.
 */
export function NotFoundArt() {
  const faceRef = useRef<SVGSVGElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  // Olhos que seguem o cursor (mesmo hook do mascote do hero).
  useEyeTracking(faceRef, { maxLook: MAX_LOOK });

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
      {/* O "0" é um planeta que escapou da órbita: o trecho de órbita tracejada fica para
          trás (com a falha por onde ele saiu), riscos de velocidade e cara de "ué". */}
      <svg ref={faceRef} className={styles.face} viewBox="0 0 120 120">
        <defs>
          <radialGradient id="nf-planet" cx="0.32" cy="0.28" r="0.85">
            <stop offset="0%" stopColor="#efe2ff" />
            <stop offset="45%" style={{ stopColor: "var(--color-accent)" }} />
            <stop offset="100%" stopColor="#3f1c8f" />
          </radialGradient>
        </defs>

        {/* Órbita de onde ele escapou (fica embaixo, à esquerda) e os riscos da fuga. */}
        <g className={styles.escape} fill="none" strokeLinecap="round">
          <path d="M-46 128c18-20 52-30 84-28m26 4c22 6 38 16 46 28" strokeWidth="2" strokeDasharray="2 7" style={{ stroke: "var(--color-accent)" }} opacity="0.55" />
          <path d="M-8 118q8-14 22-22M4 126q10-14 26-20M18 132q12-12 26-16" strokeWidth="3" style={{ stroke: "var(--color-primary)" }} opacity="0.45" />
        </g>

        {/* Anel: metade de trás antes da esfera, metade da frente depois. */}
        <ellipse cx="60" cy="64" rx="78" ry="16" transform="rotate(-14 60 64)" fill="none" strokeWidth="5" style={{ stroke: "var(--color-sparkle)" }} opacity="0.55" />
        <circle cx="60" cy="60" r="54" fill="url(#nf-planet)" />
        <path d="M-15 82a78 16 -14 0 0 151-37" fill="none" strokeWidth="5" strokeLinecap="round" style={{ stroke: "var(--color-sparkle)" }} opacity="0.9" />
        <ellipse cx="38" cy="30" rx="13" ry="7" transform="rotate(-30 38 30)" fill="#fff" opacity="0.35" />

        {/* Olhos: brancos fixos, pupilas móveis (seguem o cursor). */}
        <g className={styles.eyes} data-gaze-origin>
          <circle cx="43" cy="54" r="12" style={{ fill: "var(--color-mascot-shine)" }} />
          <circle cx="77" cy="54" r="12" style={{ fill: "var(--color-mascot-shine)" }} />
          <g data-gaze>
            <circle cx="43" cy="54" r="5.5" style={{ fill: "var(--color-mascot-ink)" }} />
            <circle cx="77" cy="54" r="5.5" style={{ fill: "var(--color-mascot-ink)" }} />
            {/* Reflexos: no mesmo grupo das pupilas, andam junto e ficam dentro da parte escura. */}
            <circle className={styles.glint} cx="45" cy="52" r="1.8" fill="#fff" />
            <circle className={styles.glint} cx="79" cy="52" r="1.8" fill="#fff" />
          </g>
        </g>
        {/* Sobrancelhas preocupadas, boca de "ué?" e uma gota de suor. */}
        <g style={{ fill: "var(--color-mascot-ink)" }}>
          <path d="M31 37c5-5 13-6 20-3 2 1 1 4-1 4-6-1-12 0-17 2-2 1-4-1-2-3Z" />
          <path d="M89 37c-5-5-13-6-20-3-2 1-1 4 1 4 6-1 12 0 17 2 2 1 4-1 2-3Z" />
          <ellipse cx="60" cy="88" rx="7" ry="9" />
        </g>
        <path d="M98 30c3 5 5 8 5 11a5 5 0 0 1-10 0c0-3 2-6 5-11Z" fill="#bfe3ff" opacity="0.9" />
      </svg>
      <span className={styles.digit}>4</span>
    </div>
  );
}
