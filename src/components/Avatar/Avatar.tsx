import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { AvatarClient } from "./AvatarClient";
import { Mascot } from "./Mascot";
import styles from "./Avatar.module.css";

/*
 * Slot do avatar. Coloque os PNGs em public/avatar/:
 *
 *   avatar-light.png        obrigatório (ou só avatar-dark.png — um cobre o outro)
 *   avatar-dark.png         versão para o tema escuro
 *   avatar-blink-light.png  opcional: mesmo desenho com os olhos fechados
 *   avatar-blink-dark.png   opcional: idem, tema escuro
 *
 * Um PNG não tem pálpebras para animar; a "piscada" troca para o frame de olhos
 * fechados por ~150ms. Sem PNG nenhum, entra o mascote SVG provisório.
 * A checagem acontece no build (o site é estático): adicionou arquivos, rebuild.
 */
const FILES = {
  light: "avatar-light.png",
  dark: "avatar-dark.png",
  blinkLight: "avatar-blink-light.png",
  blinkDark: "avatar-blink-dark.png",
} as const;

const SIZES = "(min-width: 56rem) 320px, 220px";

function publicUrl(file: string) {
  return existsSync(path.join(process.cwd(), "public", "avatar", file)) ? `/avatar/${file}` : null;
}

export function Avatar({ alt }: { alt: string }) {
  const light = publicUrl(FILES.light);
  const dark = publicUrl(FILES.dark);
  const blinkLight = publicUrl(FILES.blinkLight);
  const blinkDark = publicUrl(FILES.blinkDark);

  if (!light && !dark) {
    return (
      <AvatarClient>
        <Mascot title={alt} />
      </AvatarClient>
    );
  }

  return (
    <AvatarClient>
      <ThemeFrame variant="light" src={(light ?? dark)!} blinkSrc={blinkLight ?? blinkDark} alt={alt} />
      <ThemeFrame variant="dark" src={(dark ?? light)!} blinkSrc={blinkDark ?? blinkLight} alt={alt} />
    </AvatarClient>
  );
}

/**
 * Uma versão por tema; o CSS esconde a do outro tema com display: none. Com loading
 * lazy, a imagem escondida nem chega a ser baixada.
 */
function ThemeFrame({
  variant,
  src,
  blinkSrc,
  alt,
}: {
  variant: "light" | "dark";
  src: string;
  blinkSrc: string | null;
  alt: string;
}) {
  return (
    <div className={styles.frame} data-variant={variant}>
      <Image src={src} alt={alt} fill sizes={SIZES} className={styles.image} />
      {blinkSrc && (
        <Image src={blinkSrc} alt="" fill sizes={SIZES} className={`${styles.image} ${styles.blinkImage}`} />
      )}
    </div>
  );
}
