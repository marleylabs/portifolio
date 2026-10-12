/*
 * Explosão de partículas (corações e confetes) criada direto no DOM com a Web
 * Animations API: nada passa pelo React, então cliques rápidos não geram re-render
 * por partícula. Cada elemento se remove ao terminar a própria animação.
 */

const COLORS = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-secondary)",
  "var(--color-sparkle)",
  "var(--color-mascot-blush)",
];

const HEART_SVG =
  '<svg viewBox="0 0 24 24" width="100%" height="100%"><path fill="currentColor" d="M12 21s-7.4-4.5-9.5-9.2C.9 8.3 3.1 4.6 6.9 4.6c2.1 0 3.6 1.2 5.1 3 1.5-1.8 3-3 5.1-3 3.8 0 6 3.7 4.4 7.2C19.4 16.5 12 21 12 21Z"/></svg>';

const random = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

/**
 * `intensity` (1–10) cresce a cada clique: mais partículas, indo mais longe.
 * O último clique (10) ganha uma explosão maior.
 */
export function burst(container: HTMLElement, intensity: number) {
  const count = Math.round(6 + intensity * 1.4 + (intensity >= 10 ? 14 : 0));
  const reach = 46 + intensity * 5 + (intensity >= 10 ? 30 : 0);

  for (let i = 0; i < count; i++) {
    const isHeart = Math.random() < 0.45;
    const particle = document.createElement("span");
    const size = isHeart ? random(10, 16) : random(5, 9);
    particle.style.cssText = `position:absolute;left:50%;top:50%;width:${size}px;height:${isHeart ? size : size * 0.45}px;margin:${-size / 2}px 0 0 ${-size / 2}px;color:${pick(COLORS)};pointer-events:none;`;
    if (isHeart) particle.innerHTML = HEART_SVG;
    else particle.style.background = "currentColor";
    container.append(particle);

    // Direções aleatórias, com viés para cima; a "gravidade" puxa o fim da trajetória para baixo.
    const angle = random(-Math.PI * 1.1, Math.PI * 0.1);
    const distance = random(reach * 0.55, reach);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const spin = random(-260, 260);

    particle
      .animate(
        [
          { transform: "translate(0, 0) scale(0.3) rotate(0deg)", opacity: 1 },
          { transform: `translate(${x}px, ${y}px) scale(1) rotate(${spin * 0.6}deg)`, opacity: 1, offset: 0.55 },
          { transform: `translate(${x * 1.1}px, ${y + 28}px) scale(0.6) rotate(${spin}deg)`, opacity: 0 },
        ],
        { duration: random(650, 1000), easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
      )
      .finished.finally(() => particle.remove());
  }
}

/** Squash & stretch: amassa, estica e assenta — como uma bolinha de borracha. */
export function squashAndStretch(element: HTMLElement) {
  element.getAnimations().forEach((animation) => animation.cancel());
  element.animate(
    [
      { transform: "scale(1, 1)" },
      { transform: "scale(1.28, 0.78)", offset: 0.15 },
      { transform: "scale(0.86, 1.18)", offset: 0.4 },
      { transform: "scale(1.06, 0.95)", offset: 0.65 },
      { transform: "scale(0.98, 1.02)", offset: 0.82 },
      { transform: "scale(1, 1)" },
    ],
    { duration: 520, easing: "ease-out" },
  );
}

/** Movimento reduzido ou limite atingido: um "não" discreto (balança de leve). */
export function shake(element: HTMLElement) {
  element.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-4px)" },
      { transform: "translateX(4px)" },
      { transform: "translateX(-2px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 320, easing: "ease-in-out" },
  );
}
