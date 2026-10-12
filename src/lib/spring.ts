/*
 * Física de mola → curva CSS `linear()`.
 *
 * Simula um oscilador amortecido (massa presa a uma mola, com atrito) indo de 0 a 1 e
 * amostra a posição ao longo do tempo. O resultado vira uma easing que qualquer
 * transition/animation CSS (ou a Web Animations API) entende — molas sem biblioteca.
 * Usado em runtime (useBoop, logo) e pelo script que gera o token --ease-spring.
 */

export type SpringConfig = {
  /** Força da mola: maior = mais rápida. */
  stiffness?: number;
  /** Atrito: menor = mais quique. */
  damping?: number;
  mass?: number;
};

export type SpringEasing = {
  /** Valor pronto para transition-timing-function / easing. */
  easing: string;
  /** Tempo até a mola assentar, em ms. */
  duration: number;
};

const SIMULATION_STEP = 1 / 600; // segundos
const MAX_DURATION = 3; // segundos
const SAMPLE_COUNT = 48;
const cache = new Map<string, SpringEasing>();

export function springToLinear({ stiffness = 300, damping = 20, mass = 1 }: SpringConfig = {}): SpringEasing {
  const key = `${stiffness}:${damping}:${mass}`;
  const cached = cache.get(key);
  if (cached) return cached;

  let position = 0;
  let velocity = 0;
  let time = 0;
  let settledFor = 0;
  const samples: number[] = [];

  while (time < MAX_DURATION) {
    const force = -stiffness * (position - 1) - damping * velocity;
    velocity += (force / mass) * SIMULATION_STEP;
    position += velocity * SIMULATION_STEP;
    time += SIMULATION_STEP;
    samples.push(position);

    const isAtRest = Math.abs(position - 1) < 0.001 && Math.abs(velocity) < 0.01;
    settledFor = isAtRest ? settledFor + SIMULATION_STEP : 0;
    if (settledFor > 0.05) break;
  }

  const step = Math.max(1, Math.floor(samples.length / SAMPLE_COUNT));
  const points = samples.filter((_, index) => index % step === 0).map((value) => Number(value.toFixed(3)));
  points[points.length - 1] = 1;

  const result = { easing: `linear(0, ${points.join(", ")})`, duration: Math.round(time * 1000) };
  cache.set(key, result);
  return result;
}
