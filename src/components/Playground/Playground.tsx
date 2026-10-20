import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { PlaygroundClient } from "./PlaygroundClient";
import type { PlaygroundTemplate } from "./SandpackEditor";

type PlaygroundProps = {
  /**
   * Pasta em content/playgrounds/ com os arquivos do exemplo (recomendado): arquivos de
   * verdade, com realce no editor e sem escapar crases nem `${}`.
   */
  dir?: string;
  /**
   * Alternativa para trechos curtos: { "/index.html": `...` }. Atenção: o MDX remove das
   * linhas de continuação a indentação da linha onde a prop começa — escreva `files={{`
   * na coluna 0 ou prefira `dir`.
   */
  files?: Record<string, string>;
  /** "static" (HTML/CSS/JS puros), "vanilla" (JS com bundler) ou "react". */
  template?: PlaygroundTemplate;
  /** Arquivo aberto ao carregar (padrão: o primeiro). */
  activeFile?: string;
  /** Altura do editor e da prévia, em px. */
  height?: number;
  title?: string;
};

const LANG_BY_EXTENSION: Record<string, string> = {
  html: "html",
  css: "css",
  js: "js",
  jsx: "jsx",
  ts: "ts",
  tsx: "tsx",
  json: "json",
};

const PLAYGROUNDS_DIR = path.join(process.cwd(), "content", "playgrounds");

function readPlaygroundDir(dir: string) {
  if (!/^[a-z0-9-]+$/.test(dir)) throw new Error(`<Playground dir="${dir}">: use só minúsculas, números e hífens.`);
  const absolute = path.join(PLAYGROUNDS_DIR, dir);
  return Object.fromEntries(
    readdirSync(absolute, { withFileTypes: true })
      // Só arquivos: uma subpasta faria o readFileSync quebrar o build com EISDIR.
      .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort()
      .map((name) => [`/${name}`, readFileSync(path.join(absolute, name), "utf8")]),
  );
}

/**
 * Código editável ao vivo (Sandpack), no MDX:
 *
 *   <Playground title="Botão com mola" dir="botao-com-mola" activeFile="/styles.css" />
 *
 * (lê content/playgrounds/botao-com-mola/index.html, styles.css…)
 *
 * Desempenho: o Sandpack é grande (editor + runtime) e roda num iframe do bundler da
 * CodeSandbox. O HTML estático leva só o arquivo ativo já realçado pelo Shiki; o editor
 * de verdade é baixado quando o playground se aproxima da tela. Quem não rola até ele,
 * não paga por ele.
 */
export function Playground({ dir, files: inlineFiles, template = "static", activeFile, height = 360, title }: PlaygroundProps) {
  if (!dir === !inlineFiles) throw new Error("<Playground>: informe `dir` ou `files` (um dos dois).");
  const files = dir ? readPlaygroundDir(dir) : inlineFiles!;
  const fileNames = Object.keys(files);
  if (fileNames.length === 0) throw new Error("<Playground>: nenhum arquivo encontrado.");
  const active = activeFile ?? fileNames[0];
  if (!files[active]) throw new Error(`<Playground>: activeFile "${active}" não está em \`files\`.`);

  const extension = active.split(".").pop() ?? "";

  return (
    <PlaygroundClient files={files} template={template} activeFile={active} height={height} title={title}>
      <CodeBlock code={files[active]} lang={LANG_BY_EXTENSION[extension] ?? "txt"} filename={active.replace(/^\//, "")} />
    </PlaygroundClient>
  );
}
