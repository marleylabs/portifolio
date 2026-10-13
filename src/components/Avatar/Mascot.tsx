import styles from "./Avatar.module.css";

/*
 * Mascote orbital (desenho original em SVG, a partir de docs/referencias/mascote-orbital.png).
 * Renderizado no servidor; quem anima é o CSS (Avatar.module.css), a partir de atributos
 * que o AvatarClient põe no wrapper: data-blinking, data-surprised e o próprio :hover.
 *
 * Cada parte é um grupo próprio, para animar separado:
 *   shadow · corona · body > tuft, sphere, shine, face
 *   face > brows (browL, browR) · eyes · mouths (smile, smirk, surprise)
 *
 * No hero ele é o sol de um sistema solar (SolarSystem): a coroa pulsa junto com a
 * respiração, e os planetas orbitam em volta, fora deste SVG.
 */
export function Mascot({ title }: { title: string }) {
  return (
    <svg className={styles.mascot} viewBox="10 8 220 220" role="img" aria-label={title}>
      <defs>
        {/* Esfera: amarelo-laranja no topo esquerdo → laranja → vermelho → violeta embaixo à direita. */}
        <radialGradient id="mascot-body" cx="0.3" cy="0.24" r="0.92" fx="0.24" fy="0.18">
          <stop offset="0%" style={{ stopColor: "var(--color-mascot-1)" }} />
          <stop offset="34%" style={{ stopColor: "var(--color-mascot-2)" }} />
          <stop offset="66%" style={{ stopColor: "var(--color-mascot-3)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-mascot-4)" }} />
        </radialGradient>
        {/* Brilho de vidro: branco que some nas bordas. */}
        <radialGradient id="mascot-shine" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="mascot-tuft" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--color-mascot-3)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-mascot-2)" }} />
        </linearGradient>
        {/* Coroa do sol: brilho quente que começa na borda da esfera e some para fora. */}
        <radialGradient id="mascot-corona" cx="0.5" cy="0.5" r="0.5">
          <stop offset="66%" style={{ stopColor: "var(--color-mascot-2)", stopOpacity: 0.5 }} />
          <stop offset="82%" style={{ stopColor: "var(--color-mascot-1)", stopOpacity: 0.2 }} />
          <stop offset="100%" style={{ stopColor: "var(--color-mascot-1)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      {/* Sombra no chão: encolhe quando ele sobe (ver keyframes "shadow"). */}
      <ellipse className={styles.shadow} cx="120" cy="222" rx="56" ry="7.5" style={{ fill: "var(--color-mascot-floor)" }} />

      {/* Coroa: pulsa no mesmo ritmo da respiração (mesma duração, mesmo início). */}
      <circle className={styles.corona} cx="120" cy="136" r="112" fill="url(#mascot-corona)" />

      <g className={styles.body}>
        {/* Topete em espiral: responde aos gestos com a mola do site. */}
        <g className={styles.tuft}>
          <path
            d="M110 63c-8-17-4-34 11-42 11-6 26-5 36 3-11-2-22 0-29 7-6 6-7 15-3 25-5 2-10 4-15 7Z"
            fill="url(#mascot-tuft)"
          />
          <path d="M124 51c-1-8 3-15 10-18" fill="none" strokeWidth="2.6" strokeLinecap="round" style={{ stroke: "var(--color-mascot-1)" }} opacity="0.6" />
        </g>

        <circle className={styles.sphere} cx="120" cy="136" r="78" fill="url(#mascot-body)" />
        <ellipse className={styles.shine} cx="92" cy="94" rx="26" ry="14" transform="rotate(-28 92 94)" fill="url(#mascot-shine)" />

        <g className={styles.face}>
          {/* Sobrancelhas: acompanham ~30% do olhar (grupo de fora) e fazem as expressões
              (paths de dentro), sem uma transformação brigar com a outra. */}
          <g className={styles.brows} style={{ fill: "var(--color-mascot-ink)" }} data-gaze-follow="0.3">
            <path className={styles.browL} d="M81 104c6-7 19-10 30-6 3 1 3 6 0 7-9-1-18 1-26 5-4 2-7-3-4-6Z" />
            <path className={styles.browR} d="M159 104c-6-7-19-10-30-6-3 1-3 6 0 7 9-1 18 1 26 5 4 2 7-3 4-6Z" />
          </g>

          {/* Olhos de conta (sem parte branca): cada olho se move inteiro — rebordo, parte
              escura e reflexo — num grupo data-gaze (useEyeTracking, no AvatarClient). O grupo
              .eyes, por fora, "fecha" (scaleY) para piscar e cresce na surpresa. */}
          <g className={styles.eyes} data-gaze-origin>
            <g data-gaze>
              <ellipse cx="97" cy="126" rx="13.5" ry="15" style={{ fill: "var(--color-mascot-lid)" }} />
              <ellipse cx="97" cy="124" rx="12.5" ry="14" style={{ fill: "var(--color-mascot-ink)" }} />
              <circle className={styles.glint} cx="102" cy="118" r="3.6" fill="#fff" />
            </g>
            <g data-gaze>
              <ellipse cx="143" cy="126" rx="13.5" ry="15" style={{ fill: "var(--color-mascot-lid)" }} />
              <ellipse cx="143" cy="124" rx="12.5" ry="14" style={{ fill: "var(--color-mascot-ink)" }} />
              <circle className={styles.glint} cx="148" cy="118" r="3.6" fill="#fff" />
            </g>
          </g>

          {/* Três bocas, uma por expressão; o CSS mostra uma de cada vez. */}
          <g className={styles.mouths} fill="none" strokeLinecap="round" style={{ stroke: "var(--color-mascot-ink)" }}>
            <path className={styles.smile} d="M100 160q20 16 40 0" strokeWidth="6" />
            <path className={styles.smirk} d="M102 162q14 6 34-6" strokeWidth="6" />
            <ellipse className={styles.surprise} cx="120" cy="163" rx="7" ry="9" strokeWidth="5" style={{ fill: "var(--color-mascot-ink)" }} />
          </g>
        </g>
      </g>
    </svg>
  );
}
