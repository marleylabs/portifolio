// Verifica contraste WCAG dos pares de cores dos tokens nos dois temas.
// Lê as declarações `--color-*: light-dark(#claro, #escuro)` de src/styles/tokens.css.
// Uso: npm run check:contrast   (sai com código 1 se algum par falhar)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/styles/tokens.css"),
  "utf8",
);

const tokens = [
  ...css.matchAll(/--(color-[\w-]+):\s*light-dark\(\s*(#[0-9a-f]{6})\s*,\s*(#[0-9a-f]{6})\s*\)/gi),
];
const themes = {
  claro: Object.fromEntries(tokens.map((m) => [m[1], m[2]])),
  escuro: Object.fromEntries(tokens.map((m) => [m[1], m[3]])),
};

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// [frente, fundo, mínimo] — 4.5 para texto, 3 para elementos de UI.
const pairs = [
  ["color-text", "color-bg", 4.5],
  ["color-text", "color-surface", 4.5],
  ["color-text", "color-surface-muted", 4.5],
  ["color-text-muted", "color-bg", 4.5],
  ["color-text-muted", "color-surface", 4.5],
  ["color-text-muted", "color-surface-muted", 4.5],
  ["color-primary", "color-bg", 4.5],
  ["color-primary", "color-surface", 4.5],
  ["color-primary", "color-surface-muted", 4.5],
  ["color-primary-hover", "color-bg", 4.5],
  ["color-on-primary", "color-primary", 4.5],
  ["color-on-primary", "color-primary-hover", 4.5],
  ["color-secondary", "color-bg", 4.5],
  // Categorias (secondary) ficam sobre o card e sobre o fundo do card em hover.
  ["color-secondary", "color-surface", 4.5],
  ["color-secondary", "color-surface-muted", 4.5],
  ["color-accent", "color-bg", 4.5],
  ["color-accent", "color-surface", 4.5],
  ["color-accent", "color-surface-muted", 4.5],
  ["color-text", "color-highlight", 4.5],
  ["color-text", "color-selection", 4.5],
  ["color-text", "color-info-bg", 4.5],
  ["color-text", "color-warning-bg", 4.5],
  ["color-text", "color-success-bg", 4.5],
  ["color-text", "color-danger-bg", 4.5],
  ["color-focus", "color-bg", 3],
  ["color-info-border", "color-bg", 3],
  ["color-warning-border", "color-bg", 3],
  ["color-success-border", "color-bg", 3],
  ["color-danger-border", "color-bg", 3],
  ...[1, 2, 3, 4, 5, 6].map((n) => [`color-pill-${n}-fg`, `color-pill-${n}-bg`, 4.5]),
];

let failed = false;
for (const [name, theme] of Object.entries(themes)) {
  console.log(`\nTema ${name}`);
  for (const [fg, bg, min] of pairs) {
    if (!theme[fg] || !theme[bg]) {
      failed = true;
      console.log(`✗ token ausente: ${theme[fg] ? bg : fg}`);
      continue;
    }
    const value = ratio(theme[fg], theme[bg]);
    const ok = value >= min;
    failed ||= !ok;
    console.log(`${ok ? "✓" : "✗"} ${fg} / ${bg}: ${value.toFixed(2)} (mín. ${min})`);
  }
}
process.exit(failed ? 1 : 0);
