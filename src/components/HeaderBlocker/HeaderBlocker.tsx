import styles from "./HeaderBlocker.module.css";

/**
 * Header blocker: um retângulo sticky, da altura do header e da cor do fundo, que fica
 * parado logo atrás do header (top: 0).
 *
 * Coloque-o como PRIMEIRO filho de uma coluna que tem conteúdo sticky (ex.: o sumário
 * lateral). Quando esse conteúdo deixa de grudar no fim da coluna e sobe, ele passa por
 * BAIXO do blocker, em vez de aparecer borrado através do vidro do header.
 *
 * Funciona porque os dois são sticky no mesmo contêiner: o blocker gruda no topo da
 * tela e só vai embora quando a coluna inteira acaba. Ele reserva um espaço vazio da
 * altura do header no topo da coluna — é onde fica "estacionado" antes de grudar.
 */
export function HeaderBlocker() {
  return <div className={styles.blocker} aria-hidden="true" />;
}
