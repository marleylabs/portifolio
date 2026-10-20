"use client";

import { useEffect, useRef, useState } from "react";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import styles from "./CodeBlock.module.css";

export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const playSound = useSoundEffect();

  useEffect(() => {
    if (!copied && !failed) return;
    const id = window.setTimeout(
      () => {
        setCopied(false);
        setFailed(false);
      },
      copied ? 2000 : 4000,
    );
    return () => window.clearTimeout(id);
  }, [copied, failed]);

  async function copy() {
    const code = buttonRef.current?.closest("figure")?.querySelector("pre code");
    if (!code?.textContent) return;
    try {
      await navigator.clipboard.writeText(code.textContent);
      setCopied(true);
      playSound("success");
    } catch {
      // Sem permissão de clipboard: avisa, e o leitor ainda pode selecionar o texto.
      setFailed(true);
    }
  }

  // Os dois ícones ficam no DOM; o CSS troca um pelo outro com a mola (sem Motion).
  return (
    <button ref={buttonRef} type="button" className={styles.copy} onClick={copy} data-copied={copied}>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Código copiado" : failed ? "Não foi possível copiar. Selecione o código e copie manualmente." : ""}
      </span>
      <span aria-hidden="true" className={styles.copyIcon}>
        <svg
          className={styles.copyGlyph}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          className={styles.checkGlyph}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
      <span>{copied ? "Copiado!" : failed ? "Não copiou" : "Copiar"}</span>
    </button>
  );
}
