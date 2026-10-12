"use client";

import { useBoop } from "@/hooks/use-boop";
import { useMotionSetting } from "@/hooks/use-preferences";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import iconButton from "@/components/IconButton/IconButton.module.css";
import styles from "./MotionToggle.module.css";

const LABEL = "Pausar animações";

/**
 * Pausa as animações que rodam sozinhas: ondas do topo, respiração e piscadas do avatar,
 * estrelinhas e a página 404 (WCAG 2.2.2). As que respondem a um gesto (boop, mola dos
 * botões) continuam. A preferência fica salva, como o tema e o som.
 *
 * Botão de alternância: o rótulo é fixo e o estado vai em aria-pressed, que os leitores
 * de tela anunciam ao alternar ("pressionado" / "não pressionado").
 */
export function MotionToggle() {
  const [motion, setMotion] = useMotionSetting();
  const playSound = useSoundEffect();
  const [boopStyle, boop] = useBoop({ scale: 1.15, rotation: 10, timing: 150 });
  const paused = motion === null ? undefined : motion === "paused";

  function toggle() {
    const next = motion === "paused" ? "on" : "paused";
    setMotion(next);
    playSound(next === "on" ? "popUp" : "popDown");
  }

  return (
    <button
      type="button"
      className={iconButton.button}
      onClick={toggle}
      onPointerEnter={boop}
      aria-label={LABEL}
      aria-pressed={paused}
      title={paused ? "Retomar animações" : LABEL}
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
  );
}
