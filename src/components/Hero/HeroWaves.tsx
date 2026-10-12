import { wavePath } from "@/lib/waves";
import styles from "./Hero.module.css";

const WIDTH = 1440;
const HEIGHT = 320;

const LAYERS = [
  {
    id: "back",
    path: wavePath({ width: WIDTH, height: HEIGHT, baseline: 110, amplitude: 34, wavelength: 760, phase: 0.6 }),
    from: "var(--color-accent)",
    to: "var(--color-secondary)",
    opacity: 0.28,
  },
  {
    id: "middle",
    path: wavePath({ width: WIDTH, height: HEIGHT, baseline: 165, amplitude: 28, wavelength: 620, phase: 2.4, harmonic: 0.5 }),
    from: "var(--color-primary)",
    to: "var(--color-accent)",
    opacity: 0.38,
  },
  {
    id: "front",
    path: wavePath({ width: WIDTH, height: HEIGHT, baseline: 230, amplitude: 22, wavelength: 900, phase: 4.1, harmonic: 0.25 }),
    from: "var(--color-sparkle)",
    to: "var(--color-primary)",
    opacity: 0.32,
  },
] as const;

/**
 * Ondas do hero: três camadas coloridas que flutuam devagar e, por cima, uma onda da
 * cor do fundo da página — é ela que faz o hero "derreter" na seção seguinte, em vez
 * de terminar numa linha reta. Cores vêm dos tokens, então acompanham o tema.
 */
export function HeroWaves() {
  return (
    <svg
      className={styles.waves}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {LAYERS.map(({ id, from, to }) => (
          <linearGradient key={id} id={`hero-wave-${id}`} x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" style={{ stopColor: from }} />
            <stop offset="100%" style={{ stopColor: to }} />
          </linearGradient>
        ))}
      </defs>

      {LAYERS.map(({ id, path, opacity }) => (
        <path
          key={id}
          className={styles.wave}
          data-layer={id}
          d={path}
          fill={`url(#hero-wave-${id})`}
          opacity={opacity}
        />
      ))}

      {/* Onda final, parada, na cor do fundo: costura o hero com o resto da página. */}
      <path
        className={styles.waveFloor}
        d={wavePath({ width: WIDTH, height: HEIGHT, baseline: 280, amplitude: 14, wavelength: 1100, phase: 1.2, harmonic: 0.2 })}
      />
    </svg>
  );
}
