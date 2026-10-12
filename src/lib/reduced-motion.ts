export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Leitura pontual, para código fora do React (ex.: troca de tema em lib/preferences).
 * Dentro de componentes, use o hook usePrefersReducedMotion, que reage a mudanças.
 */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
