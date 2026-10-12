import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./EntryLink.module.css";

type EntryLinkProps = {
  href: string;
  isExternal: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Link de um card de conteúdo. Entradas com externalUrl abrem em nova aba e avisam
 * disso de duas formas: um ícone para quem vê e um texto oculto para leitores de tela
 * (abrir nova aba sem avisar desorienta, especialmente quem navega sem ver a tela).
 */
export function EntryLink({ href, isExternal, className, children }: EntryLinkProps) {
  if (!isExternal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalIcon />
      <span className="visually-hidden"> (abre em nova aba)</span>
    </a>
  );
}

export function ExternalIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4 11 13" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </svg>
  );
}
