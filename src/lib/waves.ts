/*
 * Gerador de ondas em SVG.
 * Cada onda é a soma de duas senoides (uma principal + um harmônico deslocado), o que
 * evita o aspecto "de livro de física" de uma senoide pura. Tudo é determinístico:
 * roda no servidor e o HTML sai pronto, sem JS no cliente.
 */

export type WaveOptions = {
  /** Largura e altura do viewBox. */
  width: number;
  height: number;
  /** Altura média da crista (em unidades do viewBox, a partir do topo). */
  baseline: number;
  amplitude: number;
  /** Distância entre duas cristas. */
  wavelength: number;
  phase?: number;
  /** Peso do harmônico secundário (0 = senoide pura). */
  harmonic?: number;
  /** Quanto a onda passa das bordas — folga para a animação de flutuação lateral. */
  overscan?: number;
};

const STEP = 12;

export function wavePath({
  width,
  height,
  baseline,
  amplitude,
  wavelength,
  phase = 0,
  harmonic = 0.35,
  overscan = 80,
}: WaveOptions) {
  const points: string[] = [];
  for (let x = -overscan; x <= width + overscan; x += STEP) {
    const t = (x / wavelength) * Math.PI * 2 + phase;
    const y = baseline + amplitude * (Math.sin(t) + harmonic * Math.sin(2.3 * t + 1.7));
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${-overscan},${height} L${points.join(" L")} L${width + overscan},${height} Z`;
}
