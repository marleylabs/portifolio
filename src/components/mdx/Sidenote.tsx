import type { ReactNode } from "react";
import styles from "./Sidenote.module.css";

type SidenoteType = "info" | "warning" | "success";

const LABELS: Record<SidenoteType, string> = {
  info: "Nota",
  warning: "Atenção",
  success: "Dica",
};

const ICONS: Record<SidenoteType, ReactNode> = {
  info: <path d="M12 16v-4m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" />,
  warning: <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  success: <path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />,
};

export function Sidenote({ type = "info", children }: { type?: SidenoteType; children: ReactNode }) {
  return (
    <aside className={styles.sidenote} data-type={type} aria-label={LABELS[type]}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICONS[type]}
      </svg>
      <div className={styles.content}>{children}</div>
    </aside>
  );
}
