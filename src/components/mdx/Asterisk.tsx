import { useId, type CSSProperties, type ReactNode } from "react";
import styles from "./Asterisk.module.css";

/**
 * Nota de rodapé em linha: um asterisco que abre a nota ali mesmo, sem levar o leitor
 * para o fim da página.
 *
 *   Funciona em todos os navegadores modernos<Asterisk>Exceto os muito antigos.</Asterisk>.
 *
 * Usa a Popover API nativa: abrir, fechar com Esc ou clique fora e devolver o foco
 * funcionam sem nenhuma linha de JavaScript. Onde há CSS anchor positioning, a nota
 * aparece colada ao asterisco; nos demais navegadores, centralizada na tela.
 */
export function Asterisk({ children, marker = "*" }: { children: ReactNode; marker?: string }) {
  const reactId = useId();
  const id = `nota-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const anchor = { "--asterisk-anchor": `--${id}` } as CSSProperties;

  return (
    <>
      <button type="button" popoverTarget={id} className={styles.trigger} style={anchor} aria-label="Ver nota">
        <span aria-hidden="true">{marker}</span>
      </button>
      <span id={id} popover="auto" role="note" className={styles.note} style={anchor}>
        {children}
      </span>
    </>
  );
}
