"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Header.module.css";

/**
 * Header sticky que ganha um vidro fosco depois que a página rola.
 * Em vez de ouvir `scroll` (dispara a cada frame), um IntersectionObserver observa uma
 * "sentinela" de poucos pixels no topo do documento: quando ela sai da tela, rolamos.
 */
export function StickyHeader({ children }: { children: ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setIsScrolled(!entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
      <header className={styles.header} data-scrolled={isScrolled}>
        {/* Vidro fosco: elemento próprio, mais alto que o header (ver Header.module.css). */}
        <div className={styles.backdrop} aria-hidden="true" />
        {children}
      </header>
    </>
  );
}
