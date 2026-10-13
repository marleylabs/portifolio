import Link from "next/link";
import { PROJECT_AREAS, type ProjectArea } from "@/lib/categories";
import type { CSSProperties, ReactNode } from "react";
import { SolarFocus } from "./SolarFocus";
import styles from "./SolarSystem.module.css";

/*
 * Sistema solar do hero: o mascote (children) é o sol e cada planeta é uma área de
 * trabalho (PROJECT_AREAS) — um link real para /projetos?area=….
 *
 * Só CSS, só transform: cada órbita é uma pilha de transforms (plano inclinado e achatado
 * → giro → raio → contra-giro → desachatamento). Para passar na frente e atrás do sol sem
 * animar z-index (que roda na thread principal), cada planeta é desenhado duas vezes, com
 * as mesmas animações: a camada de trás (z abaixo do sol) é o link real; a da frente (z
 * acima do sol) é uma cópia decorativa recortada à metade da órbita mais perto de quem
 * olha. Nada roda em JavaScript por quadro.
 *
 * Geometria em frações do tamanho do sol (--S), calculada para que nenhum planeta passe
 * acima da linha dos olhos e, na frente da esfera, sempre abaixo da boca. Mobile: só os
 * três primeiros, em órbitas menores (cabem em 320px).
 *
 * Estados: hover ou foco em um planeta param todas as órbitas (com um "deslize" em mola);
 * "Pausar animações" congela; "reduzir movimento" deixa cada planeta na posição inicial.
 */

type Orbit = { rx: number; ry: number; dy: number; tilt: number };
type Planet = {
  /** Área (rótulo visível vem de PROJECT_AREAS; o link filtra /projetos?area=id). */
  id: ProjectArea;
  /** Detalhe que entra no nome acessível. */
  detail: string;
  /** Raio do planeta (fração do sol) e duas cores do degradê. */
  size: number;
  colors: [string, string];
  /** Segundos por volta e ângulo inicial na órbita. */
  period: number;
  start: number;
  ring?: boolean;
  desktop: Orbit;
  /** Ausente: o planeta não aparece no celular. */
  mobile?: Orbit;
};

const PLANETS: Planet[] = [
  {
    id: "frontend",
    detail: "React e Next.js",
    size: 0.04,
    colors: ["#d9c8ff", "#6d3fd1"],
    period: 26,
    start: 30,
    desktop: { rx: 0.5, ry: 0.13, dy: 0.175, tilt: -5 },
    mobile: { rx: 0.47, ry: 0.12, dy: 0.19, tilt: -5 },
  },
  {
    id: "backend",
    detail: "Node.js, Python e Java",
    size: 0.048,
    colors: ["#ffc9a0", "#d8491a"],
    period: 33,
    start: 150,
    desktop: { rx: 0.6, ry: 0.15, dy: 0.165, tilt: 4 },
    mobile: { rx: 0.54, ry: 0.14, dy: 0.16, tilt: 4 },
  },
  {
    id: "dados",
    detail: "modelagem e consultas",
    size: 0.056,
    colors: ["#ffe7a0", "#d98c12"],
    period: 41,
    start: 255,
    ring: true,
    desktop: { rx: 0.69, ry: 0.16, dy: 0.195, tilt: -6 },
    mobile: { rx: 0.6, ry: 0.15, dy: 0.17, tilt: -5 },
  },
  {
    id: "ia",
    detail: "agentes e desenvolvimento com IA",
    size: 0.045,
    colors: ["#f2c4ff", "#9b2fd6"],
    period: 49,
    start: 95,
    desktop: { rx: 0.78, ry: 0.17, dy: 0.19, tilt: 5 },
  },
  {
    id: "devops",
    detail: "deploy, infraestrutura e observabilidade",
    size: 0.036,
    colors: ["#f4efff", "#8a80c4"],
    period: 58,
    start: 205,
    desktop: { rx: 0.86, ry: 0.18, dy: 0.185, tilt: -3 },
  },
];

// Centro da esfera dentro da caixa do mascote (viewBox 10 8 220 220; esfera em 120,136).
const SUN = { x: 0.5, y: (136 - 8) / 220 };

function orbitVars(prefix: "d" | "m", orbit: Orbit) {
  return {
    [`--rx-${prefix}`]: orbit.rx,
    [`--k-${prefix}`]: +(orbit.ry / orbit.rx).toFixed(4),
    [`--dy-${prefix}`]: orbit.dy,
    [`--tilt-${prefix}`]: `${orbit.tilt}deg`,
  };
}

function OrbitLayer({ planet, kind }: { planet: Planet; kind: "back" | "front" }) {
  const real = kind === "back";
  return (
    <div className={styles.layer} data-kind={kind}>
      <div className={styles.plane}>
        <div className={styles.spin}>
          <div className={styles.arm}>
            <div className={styles.counter}>
              <div className={styles.upright}>
                <Link
                  href={`/projetos?area=${planet.id}`}
                  className={styles.planet}
                  {...(real
                    ? // data-look-target: o mascote olha para o planeta em foco (useEyeTracking).
                      { "aria-label": `${PROJECT_AREAS[planet.id].label}: ${planet.detail}. Ver projetos`, "data-look-target": true }
                    : // Cópia da frente: só para o mouse; teclado e leitor de tela usam a de trás.
                      { "aria-hidden": true, tabIndex: -1, "data-look-target": true })}
                >
                  <span className={styles.body} data-ring={planet.ring || undefined} aria-hidden="true" />
                  <span className={styles.label} aria-hidden="true">
                    {PROJECT_AREAS[planet.id].label}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SolarSystem({ children }: { children: ReactNode }) {
  return (
    <div className={styles.system} style={{ "--sun-x": SUN.x, "--sun-y": SUN.y } as CSSProperties}>
      {/* Trilhas das órbitas: atrás de tudo, só decoração. */}
      <svg className={styles.trails} viewBox="-1 -1 2 2" aria-hidden="true" focusable="false">
        {PLANETS.map(({ id, desktop, mobile }) => (
          <g key={id} data-mobile={mobile ? "visible" : "hidden"}>
            {[["d", desktop] as const, ...(mobile ? [["m", mobile] as const] : [])].map(([kind, orbit]) => (
              <ellipse
                key={kind}
                data-kind={kind}
                cx="0"
                cy={orbit.dy}
                rx={orbit.rx}
                ry={orbit.ry}
                transform={`rotate(${orbit.tilt} 0 ${orbit.dy})`}
              />
            ))}
          </g>
        ))}
      </svg>

      <div className={styles.sun}>{children}</div>
      <SolarFocus />

      <ul className={styles.planets} aria-label="Áreas do meu trabalho">
        {PLANETS.map((planet) => {
          const style = {
            ...orbitVars("d", planet.desktop),
            ...(planet.mobile ? orbitVars("m", planet.mobile) : {}),
            "--size": planet.size,
            "--period": `${planet.period}s`,
            "--start": `${planet.start}deg`,
            // "Deslize" ao parar: o equivalente a ~0,2s de órbita, em graus.
            "--coast": `${((360 / planet.period) * 0.2).toFixed(2)}deg`,
            "--planet-a": planet.colors[0],
            "--planet-b": planet.colors[1],
          } as CSSProperties;

          return (
            <li key={planet.id} className={styles.orbit} style={style} data-mobile={planet.mobile ? "visible" : "hidden"}>
              <OrbitLayer planet={planet} kind="back" />
              <OrbitLayer planet={planet} kind="front" />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
