import { readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";
import styles from "./MdxImage.module.css";

/**
 * Imagens de Markdown: ![texto alternativo](/caminho.png "Legenda opcional").
 *
 * Roda no servidor (no build): lê as dimensões reais do arquivo em /public, então o
 * next/image reserva o espaço certo (sem salto de layout) e serve WebP/AVIF no tamanho
 * da tela. O "title" do Markdown vira legenda (<figcaption>).
 */
export function MdxImage({ src, alt = "", title }: ComponentPropsWithoutRef<"img">) {
  if (typeof src !== "string") return null;

  if (!src.startsWith("/")) {
    throw new Error(`Imagem "${src}": use um arquivo em /public (caminho começando com /).`);
  }
  if (!alt) {
    throw new Error(`Imagem "${src}" sem texto alternativo: escreva ![descrição](${src}).`);
  }

  const { width, height } = imageSize(readFileSync(path.join(process.cwd(), "public", src)));

  return (
    <figure className={styles.figure}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 50rem) 46rem, 100vw"
        className={styles.image}
      />
      {title && <figcaption className={styles.caption}>{title}</figcaption>}
    </figure>
  );
}
