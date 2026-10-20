"use client";

import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { PlaygroundTemplate } from "./SandpackEditor";
import styles from "./Playground.module.css";

// Chunk separado: só é baixado quando `isNear` vira true.
const SandpackEditor = lazy(() => import("./SandpackEditor"));

type PlaygroundClientProps = {
  files: Record<string, string>;
  template: PlaygroundTemplate;
  activeFile: string;
  height: number;
  title?: string;
  /** Prévia estática (código realçado no servidor), exibida até o editor carregar. */
  children: ReactNode;
};

export function PlaygroundClient({ files, template, activeFile, height, title, children }: PlaygroundClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Começa a carregar pouco antes de o playground entrar na tela. Margem pequena de
    // propósito: quem só abre a página (ou o Lighthouse, que não rola) não baixa o editor.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Mesma altura do editor: sem isso, a prévia (o arquivo inteiro) era bem mais alta e o
  // texto abaixo "pulava" para cima quando o editor terminava de carregar.
  const fallback = (
    <div className={styles.fallback} style={{ "--editor-height": `${height}px` } as CSSProperties}>
      {children}
      <p className={styles.loading}>{isNear ? "Carregando o editor ao vivo…" : "Editor ao vivo carrega ao chegar aqui."}</p>
    </div>
  );

  return (
    <section ref={containerRef} className={styles.playground} aria-label={title ? `Playground: ${title}` : "Playground de código"}>
      {title && <p className={`label ${styles.title}`}>{title}</p>}
      {isNear ? (
        <Suspense fallback={fallback}>
          <SandpackEditor files={files} template={template} activeFile={activeFile} height={height} />
        </Suspense>
      ) : (
        fallback
      )}
    </section>
  );
}
