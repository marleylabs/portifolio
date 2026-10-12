import Image from "next/image";
import type { AboutPage } from "@/lib/content";
import { site } from "@/lib/site";
import styles from "./About.module.css";

/**
 * Foto da página Sobre, num "polaroid" levemente inclinado que se endireita no hover.
 * Sem foto configurada, mostra as iniciais (um aviso discreto, não uma imagem falsa).
 */
export function AboutPhoto({ photo }: { photo: AboutPage["photo"] }) {
  const initials = site.name
    .split(" ")
    .map((word) => word[0])
    .join("");

  return (
    <figure className={styles.photo}>
      {photo ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 60rem) 22rem, 80vw"
          loading="eager"
          fetchPriority="high"
          className={styles.photoImage}
        />
      ) : (
        <div className={styles.photoPlaceholder} role="img" aria-label={`Iniciais de ${site.name} (foto ainda não adicionada)`}>
          {initials}
        </div>
      )}
    </figure>
  );
}
