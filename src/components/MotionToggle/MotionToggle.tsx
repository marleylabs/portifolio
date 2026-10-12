"use client";

import { useId } from "react";
import { useBoop } from "@/hooks/use-boop";
import { useMotionSetting } from "@/hooks/use-preferences";
import { useSystemReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import iconButton from "@/components/IconButton/IconButton.module.css";
import styles from "./MotionToggle.module.css";

const LABEL = "Pausar animações";
export const SYSTEM_REDUCED_HINT = "Animações reduzidas pelas configurações do seu sistema";

/**
 * Pausa as animações que rodam sozinhas: ondas do topo, respiração e piscadas do avatar,
 * estrelinhas e a página 404 (WCAG 2.2.2). As que respondem a um gesto (boop, mola dos
 * botões) continuam. A preferência fica salva, como o tema e o som.
 *
 * Botão de alternância: o rótulo é fixo e o estado vai em aria-pressed, que os leitores
 * de tela anunciam ao alternar ("pressionado" / "não pressionado").
 *
 * Com "reduzir movimento" ligado no sistema, o sistema vence: o botão aparece pausado,
 * com aria-disabled (continua focável, para a dica ser lida) e uma dica no hover/foco.
 * O ícone segue o mesmo media query no CSS, sem esperar a hidratação.
 */
export function MotionToggle() {
  const [motion, setMotion] = useMotionSetting();
  const playSound = useSoundEffect();
  const [boopStyle, boop] = useBoop({ scale: 1.15, rotation: 10, timing: 150 });
  const systemReduced = useSystemReducedMotion();
  const hintId = useId();
  const paused = systemReduced || (motion === null ? undefined : motion === "paused");

  function toggle() {
    if (systemReduced) return;
    const next = motion === "paused" ? "on" : "paused";
    setMotion(next);
    playSound(next === "on" ? "popUp" : "popDown");
  }

  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={iconButton.button}
        onClick={toggle}
        onPointerEnter={boop}
        aria-label={LABEL}
        aria-pressed={paused}
        aria-disabled={systemReduced || undefined}
        aria-describedby={systemReduced ? hintId : undefined}
        title={systemReduced ? undefined : paused ? "Retomar animações" : LABEL}
      >
        <span className={iconButton.icon} style={boopStyle}>
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            {/* Pausa (duas barras) quando anima; "play" quando está pausado. */}
            <g className={styles.pause}>
              <rect x="6" y="5" width="4" height="14" rx="1.2" />
              <rect x="14" y="5" width="4" height="14" rx="1.2" />
            </g>
            <path className={styles.play} d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
          </svg>
        </span>
      </button>
      <span id={hintId} role="tooltip" className={styles.hint}>
        {SYSTEM_REDUCED_HINT}
      </span>
    </span>
  );
}
