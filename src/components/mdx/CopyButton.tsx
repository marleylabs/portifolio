"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { MotionRoot } from "@/components/Providers/MotionRoot";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import styles from "./CodeBlock.module.css";

const spring = { type: "spring", stiffness: 500, damping: 22 } as const;

export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const playSound = useSoundEffect();

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  async function copy() {
    const code = buttonRef.current?.closest("figure")?.querySelector("pre code");
    if (!code?.textContent) return;
    try {
      await navigator.clipboard.writeText(code.textContent);
      setCopied(true);
      playSound("success");
    } catch {
      // Sem permissão de clipboard: o usuário ainda pode selecionar o texto manualmente.
    }
  }

  return (
    <button ref={buttonRef} type="button" className={styles.copy} onClick={copy}>
      <span className="visually-hidden" aria-live="polite">
        {copied ? "Código copiado" : ""}
      </span>
      <span aria-hidden="true" className={styles.copyIcon}>
        <MotionRoot>
          <AnimatePresence initial={false} mode="popLayout">
            <m.svg
              key={copied ? "check" : "copy"}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring}
            >
              {copied ? (
                <path d="M20 6 9 17l-5-5" />
              ) : (
                <>
                  <rect x="9" y="9" width="12" height="12" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </>
              )}
            </m.svg>
          </AnimatePresence>
        </MotionRoot>
      </span>
      <span>{copied ? "Copiado!" : "Copiar"}</span>
    </button>
  );
}
