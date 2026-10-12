"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import styles from "./PushButton.module.css";

type PushButtonProps = {
  href: string;
  variant?: "primary" | "secondary";
  children: ReactNode;
};

/**
 * Link com cara de botão físico: três camadas empilhadas (sombra, borda e face).
 * No hover a face sobe com mola; ao pressionar, afunda quase instantaneamente e a
 * sombra "encolhe" junto — e toca um "pop". Todo o movimento é CSS.
 */
export function PushButton({ href, variant = "primary", children }: PushButtonProps) {
  const playSound = useSoundEffect();

  return (
    <Link href={href} className={styles.pushable} data-variant={variant} onClick={() => playSound("pop")}>
      <span className={styles.shadow} aria-hidden="true" />
      <span className={styles.edge} aria-hidden="true" />
      <span className={styles.front}>{children}</span>
    </Link>
  );
}
