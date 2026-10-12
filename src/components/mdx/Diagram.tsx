import { useId } from "react";
import styles from "./Diagram.module.css";

export type DiagramNode = { id: string; label: string; note?: string };
/** [de, para, rótulo opcional] */
export type DiagramEdge = [from: string, to: string, label?: string];

type DiagramProps = {
  /** Nome do diagrama (lido por leitores de tela). */
  title: string;
  /** Colunas da esquerda para a direita; cada uma é uma pilha de caixas. */
  columns: DiagramNode[][];
  edges: DiagramEdge[];
  caption?: string;
};

// Métricas aproximadas da fonte do corpo (o SVG não mede texto no servidor).
const LABEL_CHAR = 8.4;
const NOTE_CHAR = 7;
const PAD_X = 20;
const NODE_HEIGHT = 46;
const NOTE_HEIGHT = 18;
const ROW_GAP = 28;
const COLUMN_GAP = 64;
const MARGIN = 12;

type Box = DiagramNode & { x: number; y: number; width: number; height: number; column: number };

function layout(columns: DiagramNode[][]) {
  const widths = columns.map((nodes) =>
    Math.max(
      128,
      ...nodes.map((node) =>
        Math.ceil(Math.max(node.label.length * LABEL_CHAR, (node.note?.length ?? 0) * NOTE_CHAR) + PAD_X * 2),
      ),
    ),
  );
  const heights = columns.map((nodes) =>
    nodes.reduce((total, node, index) => total + NODE_HEIGHT + (node.note ? NOTE_HEIGHT : 0) + (index ? ROW_GAP : 0), 0),
  );
  const innerHeight = Math.max(...heights);

  const boxes = new Map<string, Box>();
  let x = MARGIN;
  columns.forEach((nodes, column) => {
    // Cada coluna fica centralizada na vertical.
    let y = MARGIN + (innerHeight - heights[column]) / 2;
    for (const node of nodes) {
      const height = NODE_HEIGHT + (node.note ? NOTE_HEIGHT : 0);
      boxes.set(node.id, { ...node, x, y, width: widths[column], height, column });
      y += height + ROW_GAP;
    }
    x += widths[column] + COLUMN_GAP;
  });

  return { boxes, width: x - COLUMN_GAP + MARGIN, height: innerHeight + MARGIN * 2 };
}

/** Curva entre duas caixas: lado a lado entre colunas; de baixo para cima na mesma coluna. */
function connect(from: Box, to: Box) {
  if (from.column === to.column) {
    const [upper, lower] = from.y < to.y ? [from, to] : [to, from];
    const x = upper.x + upper.width / 2;
    const start = { x, y: from === upper ? upper.y + upper.height : lower.y };
    const end = { x, y: from === upper ? lower.y : upper.y + upper.height };
    return { d: `M${start.x},${start.y} L${end.x},${end.y}`, mid: { x, y: (start.y + end.y) / 2 } };
  }

  const forward = from.column < to.column;
  const start = { x: forward ? from.x + from.width : from.x, y: from.y + from.height / 2 };
  const end = { x: forward ? to.x : to.x + to.width, y: to.y + to.height / 2 };
  const dx = Math.max(40, Math.abs(end.x - start.x) / 2) * (forward ? 1 : -1);
  const c1 = { x: start.x + dx, y: start.y };
  const c2 = { x: end.x - dx, y: end.y };
  // Ponto da curva em t = 0,5 (fórmula da Bézier cúbica), para o rótulo.
  const mid = {
    x: (start.x + 3 * c1.x + 3 * c2.x + end.x) / 8,
    y: (start.y + 3 * c1.y + 3 * c2.y + end.y) / 8,
  };
  return { d: `M${start.x},${start.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`, mid };
}

/**
 * Diagrama de arquitetura desenhado no servidor (SVG estático, zero JS, cores dos
 * tokens — acompanha o tema). Uso no MDX:
 *
 *   <Diagram
 *     title="Fluxo de publicação"
 *     columns={[[{ id: "mdx", label: "Arquivos MDX" }], [{ id: "next", label: "Next.js", note: "build" }]]}
 *     edges={[["mdx", "next", "lê"]]}
 *   />
 *
 * Acessibilidade: o SVG tem <title> e uma <desc> gerada a partir das conexões, então
 * quem não vê o desenho recebe o mesmo conteúdo em texto.
 */
export function Diagram({ title, columns, edges, caption }: DiagramProps) {
  const id = useId();
  const { boxes, width, height } = layout(columns);

  for (const [from, to] of edges) {
    for (const ref of [from, to]) {
      if (!boxes.has(ref)) throw new Error(`<Diagram title="${title}">: a conexão usa "${ref}", que não existe.`);
    }
  }

  const description = edges
    .map(([from, to, label]) => `${boxes.get(from)!.label} → ${boxes.get(to)!.label}${label ? ` (${label})` : ""}`)
    .join("; ");
  const arrowId = `${id}-arrow`;

  return (
    <figure className={styles.figure}>
      <div className={styles.scroller} tabIndex={0} role="group" aria-label={`Diagrama: ${title}`}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          // Encolhe até 60% antes de rolar na horizontal (abaixo disso o texto fica ilegível).
          style={{ minWidth: Math.round(width * 0.6) }}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>{title}</title>
          <desc id={`${id}-desc`}>{`Conexões: ${description}.`}</desc>
          <defs>
            <marker id={arrowId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" className={styles.arrowHead} />
            </marker>
          </defs>

          {edges.map(([from, to], index) => (
            <path
              key={`edge-${index}`}
              d={connect(boxes.get(from)!, boxes.get(to)!).d}
              className={styles.edge}
              markerEnd={`url(#${arrowId})`}
            />
          ))}

          {[...boxes.values()].map((box) => (
            <g key={box.id}>
              <rect x={box.x} y={box.y} width={box.width} height={box.height} rx="12" className={styles.node} />
              <text
                x={box.x + box.width / 2}
                y={box.y + (box.note ? 26 : box.height / 2 + 5)}
                className={styles.label}
              >
                {box.label}
              </text>
              {box.note && (
                <text x={box.x + box.width / 2} y={box.y + 46} className={styles.note}>
                  {box.note}
                </text>
              )}
            </g>
          ))}

          {/* Rótulos por último: ficam por cima das linhas, com um fundo que os destaca. */}
          {edges.map(([from, to, label], index) => {
            if (!label) return null;
            const { mid } = connect(boxes.get(from)!, boxes.get(to)!);
            const labelWidth = label.length * NOTE_CHAR + 14;
            return (
              <g key={`label-${index}`}>
                <rect x={mid.x - labelWidth / 2} y={mid.y - 11} width={labelWidth} height="22" rx="11" className={styles.edgeLabelBg} />
                <text x={mid.x} y={mid.y + 4} className={styles.edgeLabel}>
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
