"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  type SandpackTheme,
} from "@codesandbox/sandpack-react";

export type PlaygroundTemplate = "static" | "vanilla" | "react";

/*
 * Tema feito só de tokens (CSS variables): o Sandpack injeta esses valores em variáveis
 * próprias, então o editor troca de tema junto com o site, sem re-render.
 */
const theme: SandpackTheme = {
  colors: {
    surface1: "var(--color-surface)",
    surface2: "var(--color-border)",
    surface3: "var(--color-surface-muted)",
    clickable: "var(--color-text-muted)",
    base: "var(--color-text)",
    disabled: "var(--color-text-muted)",
    hover: "var(--color-text)",
    accent: "var(--color-primary)",
    error: "var(--color-danger-border)",
    errorSurface: "var(--color-danger-bg)",
  },
  syntax: {
    plain: "var(--color-text)",
    comment: { color: "var(--color-text-muted)", fontStyle: "italic" },
    keyword: "var(--color-accent)",
    tag: "var(--color-primary)",
    punctuation: "var(--color-text-muted)",
    definition: "var(--color-pill-1-fg)",
    property: "var(--color-secondary)",
    static: "var(--color-primary)",
    string: "var(--color-pill-2-fg)",
  },
  font: {
    body: "var(--font-body)",
    mono: "var(--font-mono)",
    size: "14px",
    lineHeight: "1.6",
  },
};

type SandpackEditorProps = {
  files: Record<string, string>;
  template: PlaygroundTemplate;
  activeFile: string;
  height: number;
};

export default function SandpackEditor({ files, template, activeFile, height }: SandpackEditorProps) {
  return (
    <SandpackProvider template={template} files={files} theme={theme} options={{ activeFile, recompileDelay: 300 }}>
      <SandpackLayout>
        <SandpackCodeEditor showTabs showLineNumbers wrapContent style={{ height }} />
        <SandpackPreview showOpenInCodeSandbox={false} showRefreshButton style={{ height }} />
      </SandpackLayout>
    </SandpackProvider>
  );
}
