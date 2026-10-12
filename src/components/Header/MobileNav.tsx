"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import iconButton from "@/components/IconButton/IconButton.module.css";
import { useBoop } from "@/hooks/use-boop";
import { useSoundEffect } from "@/components/Providers/SoundProvider";
import { MotionToggle, SYSTEM_REDUCED_HINT } from "@/components/MotionToggle/MotionToggle";
import { SoundToggle } from "@/components/SoundToggle/SoundToggle";
import { navigation } from "@/lib/site";
import { isCurrentPath } from "./NavLinks";
import styles from "./MobileNav.module.css";

/**
 * Menu mobile em um <dialog> modal: o navegador cuida do trap de foco, do Esc, de
 * tornar o resto da página inerte e de devolver o foco ao botão ao fechar.
 * A animação (mola) é CSS com @starting-style; o scroll do body é travado pelo CSS
 * global `:root:has(dialog[open])`.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const playSound = useSoundEffect();
  const drawerId = useId();
  const [boopStyle, boop] = useBoop({ x: 3, timing: 150 });

  // Navegou (inclusive pelo botão voltar)? Fecha o menu.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  function open() {
    dialogRef.current?.showModal();
    setIsOpen(true);
    playSound("popUp");
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleClose() {
    setIsOpen(false);
    playSound("popDown");
  }

  // Clique no backdrop: o alvo é o próprio <dialog> (o painel ocupa todo o resto).
  function handleDialogClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) close();
  }

  return (
    <>
      <button
        type="button"
        className={`${iconButton.button} ${styles.trigger}`}
        onClick={open}
        onPointerEnter={boop}
        aria-label="Abrir menu"
        aria-expanded={isOpen}
        aria-controls={drawerId}
      >
        <span className={iconButton.icon} style={boopStyle}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="14" y2="17" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        id={drawerId}
        className={styles.drawer}
        aria-label="Menu"
        onClose={handleClose}
        onClick={handleDialogClick}
      >
        <div className={styles.panel}>
          <div className={styles.top}>
            <span className={styles.heading}>Menu</span>
            <button type="button" className={iconButton.button} onClick={close} aria-label="Fechar menu">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <nav aria-label="Navegação do menu">
            <ul className={styles.list}>
              {navigation.map(({ href, label }, index) => (
                <li key={href} className={styles.item} style={{ "--i": index } as CSSProperties}>
                  <Link
                    href={href}
                    className={styles.link}
                    aria-current={isCurrentPath(pathname, href) ? "page" : undefined}
                    onClick={close}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.preferences}>
            <div className={styles.preference}>
              <span>Sons</span>
              <SoundToggle />
            </div>
            <div className={styles.preference}>
              <span>Animações</span>
              <MotionToggle />
            </div>
            {/* Visível só com "reduzir movimento" no sistema (media query no CSS). */}
            <p className={styles.preferenceNote} aria-hidden="true">
              {SYSTEM_REDUCED_HINT}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
