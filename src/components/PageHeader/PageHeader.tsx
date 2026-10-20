import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  eyebrow?: ReactNode;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({ eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      {eyebrow && <p className={`label label-category ${styles.eyebrow}`}>{eyebrow}</p>}
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
    </header>
  );
}
