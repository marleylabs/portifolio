import styles from "./CosmosLayer.module.css";

/*
 * Céu da direção "Cósmica": campo de estrelas (um <pattern> SVG repetido), algumas
 * estrelas maiores que cintilam e, na 404, órbitas finas em volta do "404".
 * Só SVG + CSS: nada de canvas nem imagens. Decorativo (aria-hidden), renderizado no
 * servidor, sempre atrás do conteúdo. As posições vêm de um gerador com semente fixa:
 * o HTML é o mesmo a cada build.
 */

type Variant = "hero" | "lost";

function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const TILE = { w: 260, h: 190 };
const tileStars = (() => {
  const random = seeded(7);
  return Array.from({ length: 22 }, () => ({
    x: +(random() * TILE.w).toFixed(1),
    y: +(random() * TILE.h).toFixed(1),
    r: +(0.5 + random() * 0.9).toFixed(2),
    o: +(0.35 + random() * 0.65).toFixed(2),
  }));
})();

// Estrelas que cintilam: poucas, em pontos escolhidos nas bordas (nada no meio do texto).
const TWINKLES: Record<Variant, { x: number; y: number; s: number }[]> = {
  // No hero, nenhuma: os planetas já fazem o papel de céu vivo.
  hero: [],
  lost: [
    { x: 12, y: 18, s: 9 },
    { x: 85, y: 12, s: 7 },
    { x: 92, y: 62, s: 10 },
  ],
};

// Órbitas decorativas só na 404 (no hero, as órbitas são as do sistema solar).
const ORBIT_CENTER: Partial<Record<Variant, { cx: string; cy: string }>> = {
  lost: { cx: "50%", cy: "20%" },
};

// Estrela de quatro pontas (o mesmo desenho das Sparkles: são do mesmo universo).
const STAR = "M0 -1Q0.12 -0.12 1 0Q0.12 0.12 0 1Q-0.12 0.12 -1 0Q-0.12 -0.12 0 -1Z";

export function CosmosLayer({ variant }: { variant: Variant }) {
  const patternId = `cosmos-stars-${variant}`;
  return (
    <svg className={styles.cosmos} data-variant={variant} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={patternId} width={TILE.w} height={TILE.h} patternUnits="userSpaceOnUse">
          {tileStars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} opacity={star.o} fill="currentColor" />
          ))}
        </pattern>
      </defs>
      <rect className={styles.field} width="100%" height="100%" fill={`url(#${patternId})`} />

      {ORBIT_CENTER[variant] && (
        <g className={styles.orbits}>
          <ellipse {...ORBIT_CENTER[variant]} rx="30%" ry="9%" />
          <ellipse {...ORBIT_CENTER[variant]} rx="40%" ry="14%" />
        </g>
      )}

      {TWINKLES[variant].map(({ x, y, s }, index) => (
        <svg key={index} x={`${x}%`} y={`${y}%`} overflow="visible">
          <path
            className={styles.twinkle}
            d={STAR}
            transform={`scale(${s})`}
            style={{ animationDelay: `${(index * 0.7) % 3.1}s` }}
          />
        </svg>
      ))}
    </svg>
  );
}
