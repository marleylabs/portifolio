import type { ComponentPropsWithoutRef } from "react";
import styles from "./MdxTable.module.css";

/**
 * Tabela do Markdown dentro de uma moldura que rola na horizontal: uma tabela larga no
 * celular rola sozinha, sem empurrar o artigo inteiro para o lado. A moldura é focável
 * e rotulada para quem rola pelo teclado (setas) ou usa leitor de tela.
 */
export function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className={styles.wrap} role="region" aria-label="Tabela (role para ver todas as colunas)" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
