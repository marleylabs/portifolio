"use client";

import { useId, type CSSProperties } from "react";
import { useBoop } from "@/hooks/use-boop";
import { useTheme } from "@/hooks/use-preferences";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import iconButton from "@/components/IconButton/IconButton.module.css";
import styles from "./ThemeToggle.module.css";

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * O estado visual (sol ↔ lua) vem 100% do CSS via :root[data-theme], então o ícone já
 * nasce correto no HTML estático — sem flash nem dependência de hidratação. O React só
 * cuida do clique, do som e do rótulo acessível.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const playSound = useSoundEffect();
  const maskId = `${useId()}-moon`;
  const [boopStyle, boop] = useBoop({ rotation: 20, timing: 200 });

  const label =
    theme === null ? "Alternar tema" : theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    playSound(next === "dark" ? "popDown" : "popUp");
  }

  return (
    <button
      type="button"
      className={iconButton.button}
      onClick={toggle}
      onPointerEnter={boop}
      aria-label={label}
      title={label}
    >
      <span className={iconButton.icon} style={boopStyle}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
          <mask id={maskId}>
            <rect x="0" y="0" width="24" height="24" fill="white" />
            {/* Fora do disco no tema claro; desliza para dentro e "morde" o sol, formando a lua. */}
            <circle className={styles.maskCircle} cx="24" cy="4" r="7" fill="black" />
          </mask>
          <circle className={styles.body} cx="12" cy="12" r="5" fill="currentColor" mask={`url(#${maskId})`} />
          <g className={styles.rays} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {RAYS.map((angle, index) => (
              <g key={angle} transform={`rotate(${angle} 12 12)`}>
                <line
                  className={styles.ray}
                  style={{ "--i": index } as CSSProperties}
                  x1="12"
                  y1="2.5"
                  x2="12"
                  y2="4"
                />
              </g>
            ))}
          </g>
        </svg>
      </span>
    </button>
  );
}
