import yaml from "js-yaml";

// Bloco entre `---` no início do arquivo; aceita CRLF e frontmatter vazio.
const FRONTMATTER = /^---\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*(?:\r?\n|$)/;

/*
 * Separa o frontmatter YAML do corpo do MDX. Quem valida os campos é o zod (lib/content).
 *
 * YAML com o schema JSON: sem conversões automáticas. O padrão do YAML transforma
 * `2026-13-45` num Date e o JavaScript "corrige" para 14/02/2027 — o erro sumiria.
 * Lendo como texto, quem valida a data (inclusive o calendário) é o zod.
 */
export function parseFrontmatter(raw: string): { data: unknown; content: string } {
  const match = FRONTMATTER.exec(raw);
  if (!match) return { data: {}, content: raw };
  return {
    data: yaml.load(match[1] ?? "", { schema: yaml.JSON_SCHEMA }) ?? {},
    content: raw.slice(match[0].length),
  };
}
