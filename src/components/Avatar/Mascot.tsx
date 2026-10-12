import styles from "./Avatar.module.css";

/**
 * Mascote provisório (desenho original em SVG), usado enquanto não há PNG em
 * public/avatar/. As cores vêm dos tokens, então ele acompanha o tema sozinho, e os
 * olhos piscam de verdade (ver [data-blinking] em Avatar.module.css).
 */
export function Mascot({ title }: { title: string }) {
  return (
    <svg className={styles.mascot} viewBox="0 0 200 200" role="img" aria-label={title}>
      <defs>
        <linearGradient id="mascot-skin" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-sparkle)" }} />
          <stop offset="55%" style={{ stopColor: "var(--color-primary)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-accent)" }} />
        </linearGradient>
      </defs>

      {/* Sombra no "chão" */}
      <ellipse cx="100" cy="186" rx="52" ry="7" style={{ fill: "var(--color-depth)" }} opacity="0.12" />

      {/* Topete */}
      <path
        d="M96 30c-6-14 4-24 16-20-8 4-9 11-4 18"
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        style={{ stroke: "var(--color-primary)" }}
      />

      {/* Corpo-cabeça: uma gota arredondada */}
      <path
        d="M100 26c44 0 74 34 74 78 0 42-30 74-74 74s-74-32-74-74c0-44 30-78 74-78Z"
        fill="url(#mascot-skin)"
      />

      {/* Brilho */}
      <ellipse cx="68" cy="62" rx="16" ry="9" transform="rotate(-30 68 62)" style={{ fill: "var(--color-mascot-shine)" }} opacity="0.35" />

      {/* Bochechas */}
      <ellipse cx="58" cy="122" rx="12" ry="7" style={{ fill: "var(--color-mascot-blush)" }} opacity="0.75" />
      <ellipse cx="142" cy="122" rx="12" ry="7" style={{ fill: "var(--color-mascot-blush)" }} opacity="0.75" />

      {/* Olhos: o grupo inteiro "fecha" (scaleY) para piscar */}
      <g className={styles.eyes} style={{ fill: "var(--color-mascot-ink)" }}>
        <ellipse cx="76" cy="100" rx="9" ry="12" />
        <ellipse cx="124" cy="100" rx="9" ry="12" />
        <circle cx="79" cy="95" r="3" style={{ fill: "var(--color-mascot-shine)" }} />
        <circle cx="127" cy="95" r="3" style={{ fill: "var(--color-mascot-shine)" }} />
      </g>

      {/* Sorriso */}
      <path
        d="M84 130q16 16 32 0"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        style={{ stroke: "var(--color-mascot-ink)" }}
      />
    </svg>
  );
}
